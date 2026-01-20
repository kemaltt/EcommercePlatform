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
} from "../shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db, pool } from "./src/config/db";
import { eq, and, desc, sql } from "drizzle-orm";
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
  getProducts(category?: string, search?: string): Promise<Product[]>;
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

  async getProducts(category?: string, search?: string): Promise<Product[]> {
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
      const existingProducts = await db.select().from(products);

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
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: Omit<InsertUser, "confirmPassword">): Promise<User> {
    const [newUser] = await db
      .insert(users)
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
      } as any)
      .returning();
    return newUser;
  }

  async updateUser(
    id: string,
    userData: Partial<User>,
  ): Promise<User | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set(userData)
        .where(eq(users.id, id))
        .returning();

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
      .from(products)
      .where(eq(products.id, id));
    return product;
  }

  async getProducts(category?: string, search?: string): Promise<Product[]> {
    let query: any = db.select().from(products);

    if (category && category !== "all") {
      query = query.where(eq(products.category, category)) as any;
    }

    // Basit arama için içerik araması yaparız
    // Daha gelişmiş aramalar için tam metin araması eklenebilir
    if (search) {
      // PostgreSQL'de ILIKE büyük/küçük harf duyarlı olmadan arama yapar
      query = query.where(
        sql`${products.name} ILIKE ${`%${search}%`} OR ${
          products.description
        } ILIKE ${`%${search}%`}`,
      );
    }

    const results = (await query.orderBy(
      desc(products.createdAt),
    )) as unknown as Product[];

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
    const [newProduct] = await db
      .insert(products)
      .values({
        ...product,
        createdAt: new Date(),
      })
      .returning();
    return newProduct;
  }

  async updateProduct(
    id: string,
    productData: Partial<Product>,
  ): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set(productData)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return !!result;
  }

  // Favorites operations
  async getFavorites(userId: string): Promise<Product[]> {
    const result = await db
      .select()
      .from(favorites)
      .innerJoin(products, eq(favorites.productId, products.id))
      .where(eq(favorites.userId, userId));

    return result.map((row) => row.products);
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

    const [newFavorite] = await db
      .insert(favorites)
      .values(favorite)
      .returning();
    return newFavorite;
  }

  async removeFavorite(userId: string, productId: string): Promise<boolean> {
    const result = await db
      .delete(favorites)
      .where(
        and(eq(favorites.userId, userId), eq(favorites.productId, productId)),
      );
    return !!result;
  }

  async checkFavorite(userId: string, productId: string): Promise<boolean> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(favorites)
      .where(
        and(eq(favorites.userId, userId), eq(favorites.productId, productId)),
      );
    return result.count > 0;
  }

  // Cart operations
  async getCartItems(
    userId: string,
  ): Promise<(CartItem & { product: Product })[]> {
    const result = await db
      .select()
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId));

    return result.map((row) => ({
      ...row.cart_items,
      product: row.products,
    }));
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

    const [newCartItem] = await db
      .insert(cartItems)
      .values(cartItemWithQuantity)
      .returning();
    return newCartItem;
  }

  async updateCartItemQuantity(
    id: string,
    quantity: number,
  ): Promise<CartItem | undefined> {
    const [updatedCartItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedCartItem;
  }

  async removeCartItem(id: string): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id));
    return !!result;
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  async getCartItemByUserAndProduct(
    userId: string,
    productId: string,
  ): Promise<CartItem | undefined> {
    const [cartItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)),
      );
    return cartItem;
  }

  async getUsers(): Promise<User[]> {
    try {
      // Sadece admin olmayan kullanıcıları getir
      const result = await db
        .select({
          id: users.id,
          username: users.username,
          password: users.password,
          email: users.email,
          fullName: users.fullName,
          status: users.status,
          isAdmin: users.isAdmin,
          isSuperAdmin: users.isSuperAdmin,
          address: users.address,
          createdAt: users.createdAt,
          emailVerified: users.emailVerified,
          emailVerificationToken: users.emailVerificationToken,
          avatarUrl: users.avatarUrl,
          googleId: users.googleId,
          appleId: users.appleId,
          verificationTokenExpiresAt: users.verificationTokenExpiresAt,
        })
        .from(users);

      return result as User[];
    } catch (error) {
      console.error("DatabaseStorage.getUsers error:", error);
      throw new Error("Failed to fetch users");
    }
  }

  // Address operations
  async getAddresses(userId: string): Promise<Address[]> {
    return await db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, userId))
      .orderBy(desc(addresses.isDefault), desc(addresses.createdAt));
  }

  async getAddress(id: string): Promise<Address | undefined> {
    const [address] = await db
      .select()
      .from(addresses)
      .where(eq(addresses.id, id));
    return address;
  }

  async createAddress(addressData: InsertAddress): Promise<Address> {
    const [newAddress] = await db
      .insert(addresses)
      .values({
        ...addressData,
        createdAt: new Date(),
      })
      .returning();
    return newAddress;
  }

  async updateAddress(
    id: string,
    addressData: Partial<Address>,
  ): Promise<Address | undefined> {
    const [updatedAddress] = await db
      .update(addresses)
      .set(addressData)
      .where(eq(addresses.id, id))
      .returning();
    return updatedAddress;
  }

  async deleteAddress(id: string): Promise<boolean> {
    const result = await db.delete(addresses).where(eq(addresses.id, id));
    return !!result;
  }

  // Order operations
  async createOrder(
    order: InsertOrder,
    items: InsertOrderItem[],
    pointsUsed?: number,
  ): Promise<Order> {
    return await db.transaction(async (tx) => {
      const [newOrder] = await tx
        .insert(orders)
        .values({
          ...order,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      const itemsToInsert = items.map((item) => ({
        ...item,
        orderId: newOrder.id,
      }));

      const createdItems = await tx
        .insert(orderItems)
        .values(itemsToInsert as any)
        .returning();

      if (pointsUsed && pointsUsed > 0) {
        // Verify user has points
        const [user] = await tx
          .select()
          .from(users)
          .where(eq(users.id, order.userId));

        if (!user || user.points < pointsUsed) {
          throw new Error("Insufficient points for this transaction");
        }

        // Deduct points
        await tx
          .update(users)
          .set({
            points: sql`${users.points} - ${pointsUsed}`,
          })
          .where(eq(users.id, order.userId));

        // Create history record
        await tx.insert(pointHistory).values({
          userId: order.userId,
          change: -pointsUsed,
          reason: `Redeemed on Order #${newOrder.orderNumber}`,
        });
      }

      await tx.delete(cartItems).where(eq(cartItems.userId, order.userId));

      return {
        ...newOrder,
        items: createdItems,
      };
    });
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));

    if (!order) return undefined;

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id));

    return {
      ...order,
      items,
    };
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));

    const ordersWithItems: Order[] = [];

    for (const order of userOrders) {
      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));

      ordersWithItems.push({
        ...order,
        items,
      });
    }

    return ordersWithItems;
  }

  async getAllOrders(): Promise<Order[]> {
    const allOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt));

    const ordersWithItems: Order[] = [];

    for (const order of allOrders) {
      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));

      ordersWithItems.push({
        ...order,
        items,
      });
    }

    return ordersWithItems;
  }

  async updateOrder(id: string, data: Partial<Order>): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set(data)
      .where(eq(orders.id, id))
      .returning();

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id));

    return {
      ...updatedOrder,
      items,
    };
  }

  // Coupon operations
  async createCoupon(coupon: InsertCoupon): Promise<Coupon> {
    const [newCoupon] = await db
      .insert(coupons)
      .values({
        ...coupon,
        createdAt: new Date(),
        usedCount: 0,
      } as any)
      .returning();
    return newCoupon;
  }

  async getCoupon(id: string): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.id, id));
    return coupon;
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, code));
    return coupon;
  }

  async getAllCoupons(): Promise<Coupon[]> {
    return await db.select().from(coupons).orderBy(desc(coupons.createdAt));
  }

  async updateCoupon(
    id: string,
    data: Partial<Coupon>,
  ): Promise<Coupon | undefined> {
    const [updatedCoupon] = await db
      .update(coupons)
      .set(data)
      .where(eq(coupons.id, id))
      .returning();
    return updatedCoupon;
  }

  async deleteCoupon(id: string): Promise<boolean> {
    const result = await db.delete(coupons).where(eq(coupons.id, id));
    return !!result;
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    await this.updateProductRating(newReview.productId);
    return newReview;
  }

  private async updateProductRating(productId: string) {
    const productReviews = await this.getReviewsByProduct(productId);
    const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating =
      productReviews.length > 0 ? totalRating / productReviews.length : 0;

    await db
      .update(products)
      .set({
        rating: averageRating,
        reviews: productReviews.length,
      } as any)
      .where(eq(products.id, productId));
  }

  async getReviewsByProduct(productId: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, productId));
  }

  async getReviewsByUser(userId: string): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.userId, userId));
  }

  async getReview(id: string): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review;
  }

  async deleteReview(id: string): Promise<boolean> {
    // Get review first to know productId
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));

    if (!review) return false;

    const [deleted] = await db
      .delete(reviews)
      .where(eq(reviews.id, id))
      .returning();

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
    const [updatedUser] = await db
      .update(users)
      .set({
        points: sql`${users.points} + ${amount}`,
      })
      .where(eq(users.id, userId))
      .returning();

    await db.insert(pointHistory).values({
      userId,
      change: amount,
      reason,
    });

    return updatedUser;
  }

  async redeemPoints(
    userId: string,
    amount: number,
    orderId: string,
  ): Promise<User> {
    return await db.transaction(async (tx) => {
      const [user] = await tx.select().from(users).where(eq(users.id, userId));

      if (!user || user.points < amount) {
        throw new Error("Insufficient points");
      }

      const [updatedUser] = await tx
        .update(users)
        .set({
          points: sql`${users.points} - ${amount}`,
        })
        .where(eq(users.id, userId))
        .returning();

      await tx.insert(pointHistory).values({
        userId,
        change: -amount,
        reason: `Redeemed on Order #${orderId}`,
      });

      return updatedUser;
    });
  }

  async getPointHistory(userId: string): Promise<PointHistory[]> {
    return await db
      .select()
      .from(pointHistory)
      .where(eq(pointHistory.userId, userId))
      .orderBy(desc(pointHistory.createdAt));
  }
}

export const storage = new DatabaseStorage();
