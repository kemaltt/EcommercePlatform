import {
  User,
  InsertUser,
  Product,
  InsertProduct,
  Favorite,
  InsertFavorite,
  CartItem,
  InsertCartItem,
  users,
  products,
  favorites,
  cartItems,
  addresses,
  orders,
  orderItems,
  Address,
  InsertAddress,
  Order,
  InsertOrder,
  OrderItem,
  InsertOrderItem,
  Coupon,
  InsertCoupon,
  coupons,
  Review,
  InsertReview,
  reviews,
  PointHistory,
  InsertPointHistory,
  pointHistory,
  Notification,
  InsertNotification,
  notifications,
} from "../shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db, pool } from "./src/config/db";
import { eq, and, desc, sql, asc, gte, lte } from "drizzle-orm";
import crypto from "crypto";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

// Tip düzeltmesi için SessionStore'u tanımlayalım
type SessionStore = session.Store;

// Interface defining all storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<InsertUser, "confirmPassword">): Promise<User>;
  updateUser(id: string, userData: Partial<User>): Promise<User | undefined>;

  // Product operations
  getProduct(id: string): Promise<Product | undefined>;
  getProducts(
    category?: string,
    search?: string,
    minPrice?: number,
    maxPrice?: number,
    minRating?: number,
    sortBy?: string,
  ): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(
    id: string,
    productData: Partial<Product>,
  ): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Favorites operations
  getFavorites(userId: string): Promise<Product[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: string, productId: string): Promise<boolean>;
  checkFavorite(userId: string, productId: string): Promise<boolean>;

  // Cart operations
  getCartItems(userId: string): Promise<(CartItem & { product: Product })[]>;
  addCartItem(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(
    id: string,
    quantity: number,
  ): Promise<CartItem | undefined>;
  removeCartItem(id: string): Promise<boolean>;
  clearCart(userId: string): Promise<void>;
  getCartItemByUserAndProduct(
    userId: string,
    productId: string,
  ): Promise<CartItem | undefined>;

  // Address operations
  getAddresses(userId: string): Promise<Address[]>;
  getAddress(id: string): Promise<Address | undefined>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(
    id: string,
    addressData: Partial<Address>,
  ): Promise<Address | undefined>;
  deleteAddress(id: string): Promise<boolean>;

  // Order operations
  createOrder(
    order: InsertOrder,
    items: InsertOrderItem[],
    pointsUsed?: number,
  ): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByUser(userId: string): Promise<Order[]>;

  // Session store
  sessionStore: SessionStore;

  // New method
  getUsers(): Promise<User[]>;
  getAllOrders(): Promise<Order[]>;
  updateOrder(id: string, data: Partial<Order>): Promise<Order>;

  // Coupon operations
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  getCoupon(id: string): Promise<Coupon | undefined>;
  getCouponByCode(code: string): Promise<Coupon | undefined>;
  getAllCoupons(): Promise<Coupon[]>;
  updateCoupon(id: string, data: Partial<Coupon>): Promise<Coupon | undefined>;
  deleteCoupon(id: string): Promise<boolean>;

  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByProduct(productId: string): Promise<Review[]>;
  getReview(id: string): Promise<Review | undefined>;
  getReviewsByUser(userId: string): Promise<Review[]>;
  deleteReview(id: string): Promise<boolean>;

  // Point operations
  addPoints(userId: string, amount: number, reason: string): Promise<User>;
  redeemPoints(userId: string, amount: number, orderId: string): Promise<User>;
  getPointHistory(userId: string): Promise<PointHistory[]>;

  // Notification operations
  updatePushToken(userId: string, token: string | null): Promise<void>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: string): Promise<Notification | undefined>;
}

// MemStorage kodunu koruyoruz (gerekirse tekrar kullanabiliriz)
export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private products: Map<string, Product>;
  private favorites: Map<string, Favorite>;
  private cartItems: Map<string, CartItem>;
  private addresses: Map<string, Address>;
  private orders: Map<string, Order>;
  private orderItems: Map<string, OrderItem>;
  private coupons: Map<string, Coupon>;
  private reviews: Map<string, Review>;
  private pointHistory: Map<string, PointHistory>;
  private notifications: Map<string, Notification>;
  sessionStore: SessionStore;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.favorites = new Map();
    this.cartItems = new Map();
    this.addresses = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.orderItems = new Map();
    this.coupons = new Map();
    this.reviews = new Map();
    this.pointHistory = new Map();
    this.notifications = new Map();
    this.currentId = 1;

    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });

    // Add some initial products
    this.initializeProducts();
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  private initializeProducts() {
    const sampleProducts: InsertProduct[] = [
      {
        name: "Premium Headphones",
        description:
          "High-quality over-ear headphones with noise cancellation.",
        price: 199.99,
        category: "electronics",
        imageUrl:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
        stock: 25,
        rating: 4.5,
        reviews: 42,
        isActive: true,
      },
      {
        name: "Smart Watch",
        description:
          "Modern smartwatch with fitness tracking and notifications.",
        price: 299.99,
        category: "electronics",
        imageUrl:
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1738&q=80",
        stock: 18,
        rating: 4.2,
        reviews: 28,
        isActive: true,
      },
      {
        name: "Cotton T-Shirt",
        description: "Comfortable cotton t-shirt available in multiple colors.",
        price: 24.99,
        category: "clothing",
        imageUrl:
          "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1705&q=80",
        stock: 50,
        rating: 4.0,
        reviews: 65,
        isActive: true,
      },
      {
        name: "Bestseller Novel",
        description: "Award-winning fiction novel by a renowned author.",
        price: 14.99,
        category: "books",
        imageUrl:
          "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80",
        stock: 35,
        rating: 4.8,
        reviews: 119,
        isActive: true,
      },
      {
        name: "Coffee Machine",
        description: "Modern coffee machine with multiple brewing options.",
        price: 89.99,
        category: "home",
        imageUrl:
          "https://images.unsplash.com/photo-1585155770447-2f66e2a397b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1744&q=80",
        stock: 12,
        rating: 4.3,
        reviews: 47,
        isActive: true,
      },
      {
        name: "Running Sneakers",
        description:
          "Lightweight running shoes with extra comfort and support.",
        price: 79.99,
        category: "clothing",
        imageUrl:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
        stock: 23,
        rating: 4.6,
        reviews: 92,
        isActive: true,
      },
    ];

    sampleProducts.forEach((product) => {
      this.createProduct(product);
    });
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }
  async createUser(user: Omit<InsertUser, "confirmPassword">): Promise<User> {
    const id = crypto.randomUUID();
    const now = new Date();

    const newUser: User = {
      username: user.username!,
      email: user.email,
      fullName: user.fullName,
      password: user.password || null,
      id,
      isAdmin: false,
      isSuperAdmin: false,
      status: "active",
      createdAt: now,
      emailVerified: false,
      emailVerificationToken: null,
      verificationTokenExpiresAt: null,
      address: user.address || null,
      avatarUrl: user.avatarUrl || null,
      googleId: user.googleId || null,
      appleId: user.appleId || null,
      points: 0,
      pushToken: null,
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(
    id: string,
    userData: Partial<User>,
  ): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Product operations
  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProducts(
    category?: string,
    search?: string,
    minPrice?: number,
    maxPrice?: number,
    minRating?: number,
    sortBy?: string,
  ): Promise<Product[]> {
    let products = Array.from(this.products.values());

    if (category && category !== "all") {
      products = products.filter((p) => p.category === category);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower),
      );
    }

    if (minPrice !== undefined) {
      products = products.filter((p) => p.price >= minPrice);
    }

    if (maxPrice !== undefined) {
      products = products.filter((p) => p.price <= maxPrice);
    }

    if (minRating !== undefined) {
      products = products.filter((p) => (p.rating || 0) >= minRating);
    }

    if (sortBy) {
      switch (sortBy) {
        case "price_asc":
          products.sort((a, b) => a.price - b.price);
          break;
        case "price_desc":
          products.sort((a, b) => b.price - a.price);
          break;
        case "rating_desc":
          products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case "newest":
          products.sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
          );
          break;
      }
    }

    return products;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = crypto.randomUUID();
    const now = new Date();
    const newProduct: Product = {
      ...product,
      id,
      createdAt: now,
      isActive: product.isActive ?? true,
      rating: product.rating ?? 0,
      reviews: product.reviews ?? 0,
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(
    id: string,
    productData: Partial<Product>,
  ): Promise<Product | undefined> {
    const product = await this.getProduct(id);
    if (!product) return undefined;

    const updatedProduct = { ...product, ...productData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  // Favorites operations
  async getFavorites(userId: string): Promise<Product[]> {
    const userFavorites = Array.from(this.favorites.values()).filter(
      (fav) => fav.userId === userId,
    );

    const favoritedProducts: Product[] = [];
    for (const fav of userFavorites) {
      const product = await this.getProduct(fav.productId);
      if (product) {
        favoritedProducts.push(product);
      }
    }

    return favoritedProducts;
  }

  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    // Check if already exists
    const exists = await this.checkFavorite(
      favorite.userId,
      favorite.productId,
    );
    if (exists) {
      throw new Error("Favorite already exists");
    }

    const id = crypto.randomUUID();
    const newFavorite: Favorite = { ...favorite, id };
    this.favorites.set(id, newFavorite);
    return newFavorite;
  }

  async removeFavorite(userId: string, productId: string): Promise<boolean> {
    const favorite = Array.from(this.favorites.values()).find(
      (fav) => fav.userId === userId && fav.productId === productId,
    );

    if (!favorite) return false;
    return this.favorites.delete(favorite.id);
  }

  async checkFavorite(userId: string, productId: string): Promise<boolean> {
    return Array.from(this.favorites.values()).some(
      (fav) => fav.userId === userId && fav.productId === productId,
    );
  }

  // Cart operations
  async getCartItems(
    userId: string,
  ): Promise<(CartItem & { product: Product })[]> {
    const userCartItems = Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId,
    );

    const cartWithProducts: (CartItem & { product: Product })[] = [];
    for (const item of userCartItems) {
      const product = await this.getProduct(item.productId);
      if (product) {
        cartWithProducts.push({ ...item, product });
      }
    }

    return cartWithProducts;
  }

  async addCartItem(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if already in cart, if so update quantity
    const existing = await this.getCartItemByUserAndProduct(
      cartItem.userId,
      cartItem.productId,
    );
    if (existing) {
      const quantityToAdd = cartItem.quantity || 1; // Default to 1 if undefined
      return this.updateCartItemQuantity(
        existing.id,
        existing.quantity + quantityToAdd,
      ) as Promise<CartItem>;
    }

    const id = crypto.randomUUID();
    const newCartItem: CartItem = {
      ...cartItem,
      id,
      quantity: cartItem.quantity || 1, // Default to 1 if undefined
    };
    this.cartItems.set(id, newCartItem);
    return newCartItem;
  }

  async updateCartItemQuantity(
    id: string,
    quantity: number,
  ): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;

    const updatedCartItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedCartItem);
    return updatedCartItem;
  }

  async removeCartItem(id: string): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(userId: string): Promise<void> {
    const userItems = Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId,
    );
    userItems.forEach((item) => {
      this.cartItems.delete(item.id);
    });
  }

  async getCartItemByUserAndProduct(
    userId: string,
    productId: string,
  ): Promise<CartItem | undefined> {
    return Array.from(this.cartItems.values()).find(
      (item) => item.userId === userId && item.productId === productId,
    );
  }

  // New method
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Address operations
  async getAddresses(userId: string): Promise<Address[]> {
    return Array.from(this.addresses.values()).filter(
      (addr) => addr.userId === userId,
    );
  }

  async getAddress(id: string): Promise<Address | undefined> {
    return this.addresses.get(id);
  }

  async createAddress(address: InsertAddress): Promise<Address> {
    const id = crypto.randomUUID();
    const now = new Date();
    const newAddress: Address = {
      ...address,
      id,
      createdAt: now,
      addressLine2: address.addressLine2 || null,
      phoneNumber: address.phoneNumber || null,
      isDefault: address.isDefault ?? false,
    };
    this.addresses.set(id, newAddress);
    return newAddress;
  }

  async updateAddress(
    id: string,
    addressData: Partial<Address>,
  ): Promise<Address | undefined> {
    const address = await this.getAddress(id);
    if (!address) return undefined;

    const updatedAddress = { ...address, ...addressData };
    this.addresses.set(id, updatedAddress);
    return updatedAddress;
  }

  async deleteAddress(id: string): Promise<boolean> {
    return this.addresses.delete(id);
  }

  // Order operations
  async createOrder(
    order: InsertOrder,
    items: InsertOrderItem[],
    pointsUsed?: number,
  ): Promise<Order> {
    const id = crypto.randomUUID();
    const now = new Date(); // Ensure 'now' is defined if not already in scope, or reuse existing logic

    // Note: 'now' was used in the previous code block, assuming it's defined inside function or class.
    // Wait, the previous view showed 'createdAt: now'. 'now' must be defined inside the function.
    // Let's verify the full function context. defining it here to be safe if I'm replacing the whole start.

    const newOrder: Order = {
      ...order,
      id,
      userId: order.userId, // Ensure userId is string
      status: order.status || "pending",
      paymentStatus: order.paymentStatus || "pending",
      subtotal: order.subtotal,
      shippingCost: order.shippingCost || 0,
      discount: order.discount || 0,
      total: order.total,
      shippingAddress: order.shippingAddress,
      createdAt: new Date(),
      updatedAt: new Date(),
      orderNumber: order.orderNumber,
      trackingNumber: null,
      shippingCarrier: null,
      shippedAt: null,
      couponId: order.couponId || null,
      items: [],
      shippingMethod: order.shippingMethod,
      paymentMethod: order.paymentMethod,
      tax: order.tax || 0,
    };

    this.orders.set(id, newOrder);

    const createdItems: OrderItem[] = [];
    for (const item of items) {
      const itemId = crypto.randomUUID();
      const newItem: OrderItem = {
        ...item,
        id: itemId,
        orderId: id,
        options: item.options || null,
      };
      this.orderItems.set(itemId, newItem);
      createdItems.push(newItem);
    }

    newOrder.items = createdItems;

    if (pointsUsed && pointsUsed > 0) {
      await this.redeemPoints(order.userId, pointsUsed, id);
    }

    // Clear cart (simple implementation)
    await this.clearCart(order.userId);

    return newOrder;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const items = Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === id,
    );
    return { ...order, items };
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    const userOrders = Array.from(this.orders.values()).filter(
      (order) => order.userId === userId,
    );

    const ordersWithItems: Order[] = [];
    for (const order of userOrders) {
      const items = Array.from(this.orderItems.values()).filter(
        (item) => item.orderId === order.id,
      );
      ordersWithItems.push({ ...order, items });
    }

    return ordersWithItems.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async updateOrder(id: string, data: Partial<Order>): Promise<Order> {
    const order = await this.getOrder(id);
    if (!order) throw new Error("Order not found");
    const updatedOrder = { ...order, ...data };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Coupon operations
  async createCoupon(coupon: InsertCoupon): Promise<Coupon> {
    const id = crypto.randomUUID();
    const now = new Date();
    const newCoupon: Coupon = {
      ...coupon,
      id,
      createdAt: now,
      minPurchaseAmount: coupon.minPurchaseAmount || 0,
      expirationDate: coupon.expirationDate || null,
      isActive: coupon.isActive ?? true,
      usageLimit: coupon.usageLimit || null,
      usedCount: 0,
    };
    this.coupons.set(id, newCoupon);
    return newCoupon;
  }

  async getCoupon(id: string): Promise<Coupon | undefined> {
    return this.coupons.get(id);
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    return Array.from(this.coupons.values()).find(
      (c) => c.code.toUpperCase() === code.toUpperCase(),
    );
  }

  async getAllCoupons(): Promise<Coupon[]> {
    return Array.from(this.coupons.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async updateCoupon(
    id: string,
    data: Partial<Coupon>,
  ): Promise<Coupon | undefined> {
    const coupon = await this.getCoupon(id);
    if (!coupon) return undefined;
    const updatedCoupon = { ...coupon, ...data };
    this.coupons.set(id, updatedCoupon);
    return updatedCoupon;
  }

  async deleteCoupon(id: string): Promise<boolean> {
    return this.coupons.delete(id);
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = (this.currentId++).toString();
    const newReview: Review = {
      ...review,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      comment: review.comment || null,
    };
    this.reviews.set(id, newReview);
    this.updateProductRating(newReview.productId);
    return newReview;
  }

  private updateProductRating(productId: string) {
    const productReviews = Array.from(this.reviews.values()).filter(
      (r) => r.productId === productId,
    );
    const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating =
      productReviews.length > 0 ? totalRating / productReviews.length : 0;

    const product = this.products.get(productId);
    if (product) {
      this.products.set(productId, {
        ...product,
        rating: averageRating,
        reviews: productReviews.length,
      });
    }
  }

  async getReviewsByProduct(productId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (r) => r.productId === productId,
    );
  }

  async getReviewsByUser(userId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter((r) => r.userId === userId);
  }

  async getReview(id: string): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async deleteReview(id: string): Promise<boolean> {
    const review = this.reviews.get(id);
    if (!review) return false;
    const deleted = this.reviews.delete(id);
    if (deleted) {
      this.updateProductRating(review.productId);
    }
    return deleted;
  }

  async addPoints(
    userId: string,
    amount: number,
    reason: string,
  ): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");

    const updatedUser = { ...user, points: user.points + amount };
    this.users.set(userId, updatedUser);

    const historyId = crypto.randomUUID();
    this.pointHistory.set(historyId, {
      id: historyId,
      userId,
      change: amount,
      reason,
      createdAt: new Date(),
    });

    return updatedUser;
  }

  async redeemPoints(
    userId: string,
    amount: number,
    orderId: string,
  ): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    if (user.points < amount) throw new Error("Insufficient points");

    const updatedUser = { ...user, points: user.points - amount };
    this.users.set(userId, updatedUser);

    const historyId = crypto.randomUUID();
    this.pointHistory.set(historyId, {
      id: historyId,
      userId,
      change: -amount,
      reason: `Redeemed on Order #${orderId}`, // Basic reason, could be better
      createdAt: new Date(),
    });

    return updatedUser;
  }

  async getPointHistory(userId: string): Promise<PointHistory[]> {
    return Array.from(this.pointHistory.values())
      .filter((h) => h.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Notification operations
  async updatePushToken(userId: string, token: string | null): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.pushToken = token;
    }
  }

  async createNotification(
    notification: InsertNotification,
  ): Promise<Notification> {
    const id = crypto.randomUUID();
    const newNotification: Notification = {
      ...notification,
      id,
      isRead: false,
      createdAt: new Date(),
      data: notification.data || null,
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter((n) => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markNotificationAsRead(id: string): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (notification) {
      const updated = { ...notification, isRead: true };
      this.notifications.set(id, updated);
      return updated;
    }
    return undefined;
  }
}

// DatabaseStorage sınıfı - PostgreSQL veritabanını kullanır
export class DatabaseStorage implements IStorage {
  sessionStore: SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });

    // Veritabanını başlangıç verileriyle doldur
    this.initializeData();
  }

  // Veritabanını başlangıç verileriyle doldur
  private async initializeData() {
    try {
      // Ürünleri kontrol et ve yoksa ekle
      const existingProducts = await db.select().from(products as any);

      // Hiç ürün yoksa örnek ürünleri ekle
      if (existingProducts.length === 0) {
        const sampleProducts: InsertProduct[] = [
          {
            name: "Premium Headphones",
            description:
              "High-quality over-ear headphones with noise cancellation.",
            price: 199.99,
            category: "electronics",
            imageUrl:
              "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
            stock: 25,
            rating: 4.5,
            reviews: 42,
            isActive: true,
          },
          {
            name: "Smart Watch",
            description:
              "Modern smartwatch with fitness tracking and notifications.",
            price: 299.99,
            category: "electronics",
            imageUrl:
              "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1738&q=80",
            stock: 18,
            rating: 4.2,
            reviews: 28,
            isActive: true,
          },
          {
            name: "Cotton T-Shirt",
            description:
              "Comfortable cotton t-shirt available in multiple colors.",
            price: 24.99,
            category: "clothing",
            imageUrl:
              "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1705&q=80",
            stock: 50,
            rating: 4.0,
            reviews: 65,
            isActive: true,
          },
          {
            name: "Bestseller Novel",
            description: "Award-winning fiction novel by a renowned author.",
            price: 14.99,
            category: "books",
            imageUrl:
              "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80",
            stock: 35,
            rating: 4.8,
            reviews: 119,
            isActive: true,
          },
          {
            name: "Coffee Machine",
            description: "Modern coffee machine with multiple brewing options.",
            price: 89.99,
            category: "home",
            imageUrl:
              "https://images.unsplash.com/photo-1585155770447-2f66e2a397b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1744&q=80",
            stock: 12,
            rating: 4.3,
            reviews: 47,
            isActive: true,
          },
          {
            name: "Running Sneakers",
            description:
              "Lightweight running shoes with extra comfort and support.",
            price: 79.99,
            category: "clothing",
            imageUrl:
              "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
            stock: 23,
            rating: 4.6,
            reviews: 92,
            isActive: true,
          },
        ];

        for (const product of sampleProducts) {
          await this.createProduct(product);
        }

        // Sample products added to database
      }
    } catch (error) {
      console.error("Veritabanı başlatılırken hata:", error);
    }
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users as any)
      .where(eq((users as any).id, id) as any);
    return user as User | undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users as any)
      .where(eq((users as any).username, username) as any);
    return user as User | undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users as any)
      .where(eq((users as any).email, email) as any);
    return user as User | undefined;
  }

  async createUser(user: Omit<InsertUser, "confirmPassword">): Promise<User> {
    const [newUser] = (await db
      .insert(users as any)
      .values({
        username: user.username!,
        email: user.email,
        fullName: user.fullName,
        password: user.password || null,
        address: user.address || null,
        avatarUrl: user.avatarUrl || null,
        googleId: user.googleId || null,
        appleId: user.appleId || null,
        status: "active",
        createdAt: new Date(),
        emailVerified: false,
        pushToken: null,
      } as any)
      .returning()) as any;
    return newUser;
  }

  async updateUser(
    id: string,
    userData: Partial<User>,
  ): Promise<User | undefined> {
    try {
      const [updatedUser] = (await db
        .update(users as any)
        .set(userData as any)
        .where(eq((users as any).id, id) as any)
        .returning()) as any;

      return updatedUser;
    } catch (error) {
      console.error("Error in updateUser:", error);
      throw new Error("Failed to update user");
    }
  }

  // Product operations
  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products as any)
      .where(eq((products as any).id, id) as any);
    return product as Product | undefined;
  }

  async getProducts(
    category?: string,
    search?: string,
    minPrice?: number,
    maxPrice?: number,
    minRating?: number,
    sortBy?: string,
  ): Promise<Product[]> {
    let query: any = db.select().from(products as any);

    const filters: any[] = [];

    if (category && category !== "all") {
      filters.push(eq((products as any).category, category) as any);
    }

    if (search) {
      filters.push(
        sql`${(products as any).name} ILIKE ${`%${search}%`} OR ${
          (products as any).description
        } ILIKE ${`%${search}%`}` as any,
      );
    }

    if (minPrice !== undefined) {
      filters.push(gte((products as any).price, minPrice) as any);
    }

    if (maxPrice !== undefined) {
      filters.push(lte((products as any).price, maxPrice) as any);
    }

    if (minRating !== undefined) {
      filters.push(gte((products as any).rating, minRating) as any);
    }

    if (filters.length > 0) {
      query = query.where(and(...filters));
    }

    if (sortBy) {
      switch (sortBy) {
        case "price_asc":
          query = query.orderBy(asc((products as any).price) as any);
          break;
        case "price_desc":
          query = query.orderBy(desc((products as any).price) as any);
          break;
        case "rating_desc":
          query = query.orderBy(desc((products as any).rating) as any);
          break;
        case "newest":
          query = query.orderBy(desc((products as any).createdAt) as any);
          break;
        default:
          query = query.orderBy(desc((products as any).createdAt) as any);
      }
    } else {
      query = query.orderBy(desc((products as any).createdAt) as any);
    }

    const results = (await query) as unknown as Product[];

    // Debug logging to verify imageUrl consistency
    if (results.length > 0) {
      console.log(
        `[Storage] getProducts returned ${results.length} items. First item imageUrl: ${results[0].imageUrl}`,
      );
      const missingImages = results.filter((p) => !p.imageUrl);
      if (missingImages.length > 0) {
        console.warn(
          `[Storage] Warning: ${missingImages.length} products have missing imageUrls:`,
          missingImages.map((p) => p.name),
        );
      }
    }

    return results;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = (await db
      .insert(products as any)
      .values({
        ...product,
        createdAt: new Date(),
      } as any)
      .returning()) as any;
    return newProduct;
  }

  async updateProduct(
    id: string,
    productData: Partial<Product>,
  ): Promise<Product | undefined> {
    const [updatedProduct] = (await db
      .update(products as any)
      .set(productData as any)
      .where(eq((products as any).id, id) as any)
      .returning()) as any;
    return updatedProduct as Product | undefined;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db
      .delete(products as any)
      .where(eq((products as any).id, id) as any);
    return !!result;
  }

  // Favorites operations
  async getFavorites(userId: string): Promise<Product[]> {
    const result = await db
      .select()
      .from(favorites as any)
      .innerJoin(
        products as any,
        eq((favorites as any).productId, (products as any).id) as any,
      )
      .where(eq((favorites as any).userId, userId) as any);

    return result.map((row) => (row as any).products) as Product[];
  }

  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    // Önce kontrol edelim
    const exists = await this.checkFavorite(
      favorite.userId,
      favorite.productId,
    );
    if (exists) {
      throw new Error("Favorite already exists");
    }

    const [newFavorite] = (await db
      .insert(favorites as any)
      .values(favorite as any)
      .returning()) as any;
    return newFavorite as Favorite;
  }

  async removeFavorite(userId: string, productId: string): Promise<boolean> {
    const result = await db
      .delete(favorites as any)
      .where(
        and(
          eq((favorites as any).userId, userId) as any,
          eq((favorites as any).productId, productId) as any,
        ) as any,
      );
    return !!result;
  }

  async checkFavorite(userId: string, productId: string): Promise<boolean> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(favorites as any)
      .where(
        and(
          eq((favorites as any).userId, userId) as any,
          eq((favorites as any).productId, productId) as any,
        ) as any,
      );
    return (result as any).count > 0;
  }

  // Cart operations
  async getCartItems(
    userId: string,
  ): Promise<(CartItem & { product: Product })[]> {
    const result = await db
      .select()
      .from(cartItems as any)
      .innerJoin(
        products as any,
        eq((cartItems as any).productId, (products as any).id) as any,
      )
      .where(eq((cartItems as any).userId, userId) as any);

    return result.map((row) => ({
      ...(row as any).cart_items,
      product: (row as any).products,
    })) as (CartItem & { product: Product })[];
  }

  async addCartItem(cartItem: InsertCartItem): Promise<CartItem> {
    // Sepette zaten var mı kontrol edelim
    const existing = await this.getCartItemByUserAndProduct(
      cartItem.userId,
      cartItem.productId,
    );
    if (existing) {
      const quantityToAdd = cartItem.quantity || 1; // Undefined ise 1 kullan
      return this.updateCartItemQuantity(
        existing.id,
        existing.quantity + quantityToAdd,
      ) as Promise<CartItem>;
    }

    // quantity değerini kontrol et
    const cartItemWithQuantity = {
      ...cartItem,
      quantity: cartItem.quantity || 1, // Undefined ise 1 kullan
    };

    const [newCartItem] = (await db
      .insert(cartItems as any)
      .values(cartItemWithQuantity as any)
      .returning()) as any;
    return newCartItem as CartItem;
  }

  async updateCartItemQuantity(
    id: string,
    quantity: number,
  ): Promise<CartItem | undefined> {
    const [updatedCartItem] = (await db
      .update(cartItems as any)
      .set({ quantity } as any)
      .where(eq((cartItems as any).id, id) as any)
      .returning()) as any;
    return updatedCartItem as CartItem | undefined;
  }

  async removeCartItem(id: string): Promise<boolean> {
    const result = await db
      .delete(cartItems as any)
      .where(eq((cartItems as any).id, id) as any);
    return !!result;
  }

  async clearCart(userId: string): Promise<void> {
    await db
      .delete(cartItems as any)
      .where(eq((cartItems as any).userId, userId) as any);
  }

  async getCartItemByUserAndProduct(
    userId: string,
    productId: string,
  ): Promise<CartItem | undefined> {
    const [cartItem] = await db
      .select()
      .from(cartItems as any)
      .where(
        and(
          eq((cartItems as any).userId, userId) as any,
          eq((cartItems as any).productId, productId) as any,
        ) as any,
      );
    return cartItem as CartItem | undefined;
  }

  async getUsers(): Promise<User[]> {
    try {
      // Sadece admin olmayan kullanıcıları getir
      const result = await db
        .select({
          id: users.id as any,
          username: users.username as any,
          password: users.password as any,
          email: users.email as any,
          fullName: users.fullName as any,
          status: users.status as any,
          isAdmin: users.isAdmin as any,
          isSuperAdmin: users.isSuperAdmin as any,
          address: users.address as any,
          createdAt: users.createdAt as any,
          emailVerified: users.emailVerified as any,
          emailVerificationToken: users.emailVerificationToken as any,
          avatarUrl: users.avatarUrl as any,
          googleId: users.googleId as any,
          appleId: users.appleId as any,
          verificationTokenExpiresAt: users.verificationTokenExpiresAt as any,
        } as any)
        .from(users as any);

      return result as User[];
    } catch (error) {
      console.error("DatabaseStorage.getUsers error:", error);
      throw new Error("Failed to fetch users");
    }
  }

  // Address operations
  async getAddresses(userId: string): Promise<Address[]> {
    return (await db
      .select()
      .from(addresses as any)
      .where(eq((addresses as any).userId, userId) as any)
      .orderBy(
        desc((addresses as any).isDefault),
        desc((addresses as any).createdAt),
      )) as Address[];
  }

  async getAddress(id: string): Promise<Address | undefined> {
    const [address] = await db
      .select()
      .from(addresses as any)
      .where(eq((addresses as any).id, id) as any);
    return address as Address | undefined;
  }

  async createAddress(addressData: InsertAddress): Promise<Address> {
    const [newAddress] = (await db
      .insert(addresses as any)
      .values({
        ...addressData,
        createdAt: new Date(),
      } as any)
      .returning()) as any;
    return newAddress as Address;
  }

  async updateAddress(
    id: string,
    addressData: Partial<Address>,
  ): Promise<Address | undefined> {
    const [updatedAddress] = (await db
      .update(addresses as any)
      .set(addressData as any)
      .where(eq((addresses as any).id, id) as any)
      .returning()) as any;
    return updatedAddress as Address | undefined;
  }

  async deleteAddress(id: string): Promise<boolean> {
    const result = await db
      .delete(addresses as any)
      .where(eq((addresses as any).id, id) as any);
    return !!result;
  }

  // Order operations
  async createOrder(
    order: InsertOrder,
    items: InsertOrderItem[],
    pointsUsed?: number,
  ): Promise<Order> {
    return await db.transaction(async (tx) => {
      const [newOrder] = (await tx
        .insert(orders as any)
        .values({
          ...order,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any)
        .returning()) as any;

      const itemsToInsert = items.map((item) => ({
        ...item,
        orderId: newOrder.id,
      }));

      const createdItems = (await tx
        .insert(orderItems as any)
        .values(itemsToInsert as any)
        .returning()) as any;

      if (pointsUsed && pointsUsed > 0) {
        // Verify user has points
        const [user] = await tx
          .select()
          .from(users as any)
          .where(eq((users as any).id, order.userId) as any);

        if (!user || user.points < pointsUsed) {
          throw new Error("Insufficient points for this transaction");
        }

        // Deduct points
        await tx
          .update(users as any)
          .set({
            points: sql`${users.points} - ${pointsUsed}`,
          } as any)
          .where(eq((users as any).id, order.userId) as any);

        // Create history record
        await tx.insert(pointHistory as any).values({
          userId: order.userId,
          change: -pointsUsed,
          reason: `Redeemed on Order #${newOrder.orderNumber}`,
        } as any);
      }

      await tx
        .delete(cartItems as any)
        .where(eq((cartItems as any).userId, order.userId) as any);

      return {
        ...newOrder,
        items: createdItems,
      };
    });
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db
      .select()
      .from(orders as any)
      .where(eq((orders as any).id, id) as any);

    if (!order) return undefined;

    const items = await db
      .select()
      .from(orderItems as any)
      .where(eq((orderItems as any).orderId, id) as any);

    return {
      ...order,
      items,
    } as any;
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    const userOrders = await db
      .select()
      .from(orders as any)
      .where(eq((orders as any).userId, userId) as any)
      .orderBy(desc((orders as any).createdAt) as any);

    const ordersWithItems: Order[] = [];

    for (const order of userOrders as any[]) {
      const items = (await db
        .select()
        .from(orderItems as any)
        .where(eq((orderItems as any).orderId, order.id) as any)) as any[];

      ordersWithItems.push({
        ...order,
        items,
      } as any);
    }

    return ordersWithItems;
  }

  async getAllOrders(): Promise<Order[]> {
    const allOrders = await db
      .select()
      .from(orders as any)
      .orderBy(desc((orders as any).createdAt) as any);

    const ordersWithItems: Order[] = [];

    for (const order of allOrders as any[]) {
      const items = (await db
        .select()
        .from(orderItems as any)
        .where(eq((orderItems as any).orderId, order.id) as any)) as any[];

      ordersWithItems.push({
        ...order,
        items,
      } as any);
    }

    return ordersWithItems;
  }

  async updateOrder(id: string, data: Partial<Order>): Promise<Order> {
    const [updatedOrder] = (await db
      .update(orders as any)
      .set(data as any)
      .where(eq((orders as any).id, id) as any)
      .returning()) as any;

    const items = (await db
      .select()
      .from(orderItems as any)
      .where(eq((orderItems as any).orderId, id) as any)) as any[];

    return {
      ...updatedOrder,
      items,
    } as any;
  }

  // Coupon operations
  async createCoupon(coupon: InsertCoupon): Promise<Coupon> {
    const [newCoupon] = (await db
      .insert(coupons as any)
      .values({
        ...coupon,
        createdAt: new Date(),
        usedCount: 0,
      } as any)
      .returning()) as any;
    return newCoupon as Coupon;
  }

  async getCoupon(id: string): Promise<Coupon | undefined> {
    const [coupon] = await db
      .select()
      .from(coupons as any)
      .where(eq((coupons as any).id, id) as any);
    return coupon as any;
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const [coupon] = await db
      .select()
      .from(coupons as any)
      .where(eq((coupons as any).code, code) as any);
    return coupon as any;
  }

  async getAllCoupons(): Promise<Coupon[]> {
    return (await db
      .select()
      .from(coupons as any)
      .orderBy(desc((coupons as any).createdAt) as any)) as Coupon[];
  }

  async updateCoupon(
    id: string,
    data: Partial<Coupon>,
  ): Promise<Coupon | undefined> {
    const [updatedCoupon] = (await db
      .update(coupons as any)
      .set(data as any)
      .where(eq((coupons as any).id, id) as any)
      .returning()) as any;
    return updatedCoupon as any;
  }

  async deleteCoupon(id: string): Promise<boolean> {
    const result = await db
      .delete(coupons as any)
      .where(eq((coupons as any).id, id) as any);
    return !!result;
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = (await db
      .insert(reviews as any)
      .values(review as any)
      .returning()) as any;
    await this.updateProductRating(newReview.productId);
    return newReview as Review;
  }

  private async updateProductRating(productId: string) {
    const productReviews = await this.getReviewsByProduct(productId);
    const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating =
      productReviews.length > 0 ? totalRating / productReviews.length : 0;

    await db
      .update(products as any)
      .set({
        rating: averageRating,
        reviews: productReviews.length,
      } as any)
      .where(eq((products as any).id, productId) as any);
  }

  async getReviewsByProduct(productId: string): Promise<Review[]> {
    return (await db
      .select()
      .from(reviews as any)
      .where(eq((reviews as any).productId, productId) as any)) as Review[];
  }

  async getReviewsByUser(userId: string): Promise<Review[]> {
    return (await db
      .select()
      .from(reviews as any)
      .where(eq((reviews as any).userId, userId) as any)) as Review[];
  }

  async getReview(id: string): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews as any)
      .where(eq((reviews as any).id, id) as any);
    return review as Review | undefined;
  }

  async deleteReview(id: string): Promise<boolean> {
    // Get review first to know productId
    const [review] = await db
      .select()
      .from(reviews as any)
      .where(eq((reviews as any).id, id) as any);

    if (!review) return false;

    const [deleted] = (await db
      .delete(reviews as any)
      .where(eq((reviews as any).id, id) as any)
      .returning()) as any;

    if (deleted) {
      await this.updateProductRating(review.productId);
    }

    return !!deleted;
  }

  async addPoints(
    userId: string,
    amount: number,
    reason: string,
  ): Promise<User> {
    const [updatedUser] = (await db
      .update(users as any)
      .set({
        points: sql`${(users as any).points} + ${amount}` as any,
      } as any)
      .where(eq((users as any).id, userId) as any)
      .returning()) as any;

    await db.insert(pointHistory as any).values({
      userId,
      change: amount,
      reason,
    } as any);

    return updatedUser as User;
  }

  async redeemPoints(
    userId: string,
    amount: number,
    orderId: string,
  ): Promise<User> {
    return await db.transaction(async (tx) => {
      const [user] = await tx
        .select()
        .from(users as any)
        .where(eq((users as any).id, userId) as any);

      if (!user || (user as any).points < amount) {
        throw new Error("Insufficient points");
      }

      const [updatedUser] = (await tx
        .update(users as any)
        .set({
          points: sql`${(users as any).points} - ${amount}` as any,
        } as any)
        .where(eq((users as any).id, userId) as any)
        .returning()) as any;

      await tx.insert(pointHistory as any).values({
        userId,
        change: -amount,
        reason: `Redeemed on Order #${orderId}`,
      } as any);

      return updatedUser as User;
    });
  }

  async getPointHistory(userId: string): Promise<PointHistory[]> {
    return (await db
      .select()
      .from(pointHistory as any)
      .where(eq((pointHistory as any).userId, userId) as any)
      .orderBy(desc((pointHistory as any).createdAt) as any)) as PointHistory[];
  }

  async updatePushToken(userId: string, token: string | null): Promise<void> {
    await db
      .update(users as any)
      .set({ pushToken: token } as any)
      .where(eq((users as any).id, userId) as any);
  }

  async createNotification(
    notification: InsertNotification,
  ): Promise<Notification> {
    const [newNotification] = (await db
      .insert(notifications as any)
      .values(notification as any)
      .returning()) as any;
    return newNotification as Notification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return (await db
      .select()
      .from(notifications as any)
      .where(eq((notifications as any).userId, userId) as any)
      .orderBy(
        desc((notifications as any).createdAt) as any,
      )) as unknown as Notification[];
  }

  async markNotificationAsRead(id: string): Promise<Notification | undefined> {
    const [updated] = (await db
      .update(notifications as any)
      .set({ isRead: true } as any)
      .where(eq((notifications as any).id, id) as any)
      .returning()) as any;
    return updated as Notification | undefined;
  }
}

export const storage = new DatabaseStorage();
