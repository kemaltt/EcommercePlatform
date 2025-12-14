import { User, InsertUser, Product, InsertProduct, Favorite, InsertFavorite, CartItem, InsertCartItem, users, products, favorites, cartItems } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db, pool } from "./src/config/db";
import { eq, and, desc, sql } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

// Tip düzeltmesi için SessionStore'u tanımlayalım
type SessionStore = session.Store;

// Interface defining all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<InsertUser, "confirmPassword">): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  getProducts(category?: string, search?: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, productData: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Favorites operations
  getFavorites(userId: number): Promise<Product[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: number, productId: number): Promise<boolean>;
  checkFavorite(userId: number, productId: number): Promise<boolean>;
  
  // Cart operations
  getCartItems(userId: number): Promise<(CartItem & { product: Product })[]>;
  addCartItem(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<boolean>;
  getCartItemByUserAndProduct(userId: number, productId: number): Promise<CartItem | undefined>;
  
  // Session store
  sessionStore: SessionStore;

  // New method
  getUsers(): Promise<User[]>;
}

// MemStorage kodunu koruyoruz (gerekirse tekrar kullanabiliriz)
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private favorites: Map<number, Favorite>;
  private cartItems: Map<number, CartItem>;
  private userCurrentId: number;
  private productCurrentId: number;
  private favoriteCurrentId: number;
  private cartItemCurrentId: number;
  sessionStore: SessionStore;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.favorites = new Map();
    this.cartItems = new Map();
    this.userCurrentId = 1;
    this.productCurrentId = 1;
    this.favoriteCurrentId = 1;
    this.cartItemCurrentId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Add some initial products
    this.initializeProducts();
  }

  private initializeProducts() {
    const sampleProducts: InsertProduct[] = [
      {
        name: "Premium Headphones",
        description: "High-quality over-ear headphones with noise cancellation.",
        price: 199.99,
        category: "electronics",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
        stock: 25,
        rating: 4.5,
        reviews: 42,
        isActive: true
      },
      {
        name: "Smart Watch",
        description: "Modern smartwatch with fitness tracking and notifications.",
        price: 299.99,
        category: "electronics",
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1738&q=80",
        stock: 18,
        rating: 4.2,
        reviews: 28,
        isActive: true
      },
      {
        name: "Cotton T-Shirt",
        description: "Comfortable cotton t-shirt available in multiple colors.",
        price: 24.99,
        category: "clothing",
        imageUrl: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1705&q=80",
        stock: 50,
        rating: 4.0,
        reviews: 65,
        isActive: true
      },
      {
        name: "Bestseller Novel",
        description: "Award-winning fiction novel by a renowned author.",
        price: 14.99,
        category: "books",
        imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80",
        stock: 35,
        rating: 4.8,
        reviews: 119,
        isActive: true
      },
      {
        name: "Coffee Machine",
        description: "Modern coffee machine with multiple brewing options.",
        price: 89.99,
        category: "home",
        imageUrl: "https://images.unsplash.com/photo-1585155770447-2f66e2a397b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1744&q=80",
        stock: 12,
        rating: 4.3,
        reviews: 47,
        isActive: true
      },
      {
        name: "Running Sneakers",
        description: "Lightweight running shoes with extra comfort and support.",
        price: 79.99,
        category: "clothing",
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
        stock: 23,
        rating: 4.6,
        reviews: 92,
        isActive: true
      }
    ];

    sampleProducts.forEach(product => {
      this.createProduct(product);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(user: Omit<InsertUser, "confirmPassword">): Promise<User> {
    const id = this.userCurrentId++;
    const now = new Date();
    const newUser: User = { ...user, id, createdAt: now };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Product operations
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProducts(category?: string, search?: string): Promise<Product[]> {
    let products = Array.from(this.products.values());
    
    if (category && category !== 'all') {
      products = products.filter(p => p.category === category);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }
    
    return products;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productCurrentId++;
    const now = new Date();
    const newProduct: Product = { ...product, id, createdAt: now };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, productData: Partial<Product>): Promise<Product | undefined> {
    const product = await this.getProduct(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...productData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Favorites operations
  async getFavorites(userId: number): Promise<Product[]> {
    const userFavorites = Array.from(this.favorites.values()).filter(
      fav => fav.userId === userId
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
    const exists = await this.checkFavorite(favorite.userId, favorite.productId);
    if (exists) {
      throw new Error("Favorite already exists");
    }
    
    const id = this.favoriteCurrentId++;
    const newFavorite: Favorite = { ...favorite, id };
    this.favorites.set(id, newFavorite);
    return newFavorite;
  }

  async removeFavorite(userId: number, productId: number): Promise<boolean> {
    const favorite = Array.from(this.favorites.values()).find(
      fav => fav.userId === userId && fav.productId === productId
    );
    
    if (!favorite) return false;
    return this.favorites.delete(favorite.id);
  }

  async checkFavorite(userId: number, productId: number): Promise<boolean> {
    return Array.from(this.favorites.values()).some(
      fav => fav.userId === userId && fav.productId === productId
    );
  }

  // Cart operations
  async getCartItems(userId: number): Promise<(CartItem & { product: Product })[]> {
    const userCartItems = Array.from(this.cartItems.values()).filter(
      item => item.userId === userId
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
    const existing = await this.getCartItemByUserAndProduct(cartItem.userId, cartItem.productId);
    if (existing) {
      const quantityToAdd = cartItem.quantity || 1; // Default to 1 if undefined
      return this.updateCartItemQuantity(existing.id, existing.quantity + quantityToAdd) as Promise<CartItem>;
    }
    
    const id = this.cartItemCurrentId++;
    const newCartItem: CartItem = { 
      ...cartItem, 
      id,
      quantity: cartItem.quantity || 1 // Default to 1 if undefined
    };
    this.cartItems.set(id, newCartItem);
    return newCartItem;
  }

  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;
    
    const updatedCartItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedCartItem);
    return updatedCartItem;
  }

  async removeCartItem(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async getCartItemByUserAndProduct(userId: number, productId: number): Promise<CartItem | undefined> {
    return Array.from(this.cartItems.values()).find(
      item => item.userId === userId && item.productId === productId
    );
  }

  // New method
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
}

// DatabaseStorage sınıfı - PostgreSQL veritabanını kullanır
export class DatabaseStorage implements IStorage {
  sessionStore: SessionStore;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool, 
      createTableIfMissing: true 
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
            description: "High-quality over-ear headphones with noise cancellation.",
            price: 199.99,
            category: "electronics",
            imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
            stock: 25,
            rating: 4.5,
            reviews: 42,
            isActive: true
          },
          {
            name: "Smart Watch",
            description: "Modern smartwatch with fitness tracking and notifications.",
            price: 299.99,
            category: "electronics",
            imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1738&q=80",
            stock: 18,
            rating: 4.2,
            reviews: 28,
            isActive: true
          },
          {
            name: "Cotton T-Shirt",
            description: "Comfortable cotton t-shirt available in multiple colors.",
            price: 24.99,
            category: "clothing",
            imageUrl: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1705&q=80",
            stock: 50,
            rating: 4.0,
            reviews: 65,
            isActive: true
          },
          {
            name: "Bestseller Novel",
            description: "Award-winning fiction novel by a renowned author.",
            price: 14.99,
            category: "books",
            imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80",
            stock: 35,
            rating: 4.8,
            reviews: 119,
            isActive: true
          },
          {
            name: "Coffee Machine",
            description: "Modern coffee machine with multiple brewing options.",
            price: 89.99,
            category: "home",
            imageUrl: "https://images.unsplash.com/photo-1585155770447-2f66e2a397b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1744&q=80",
            stock: 12,
            rating: 4.3,
            reviews: 47,
            isActive: true
          },
          {
            name: "Running Sneakers",
            description: "Lightweight running shoes with extra comfort and support.",
            price: 79.99,
            category: "clothing",
            imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
            stock: 23,
            rating: 4.6,
            reviews: 92,
            isActive: true
          }
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
  async getUser(id: number): Promise<User | undefined> {
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
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user;
  }
  
  async createUser(user: Omit<InsertUser, "confirmPassword">): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values({
        ...user,
        createdAt: new Date()
      })
      .returning();
    return newUser;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set(userData)
        .where(eq(users.id, id))
        .returning({
          id: users.id,
          username: users.username,
          email: users.email,
          fullName: users.fullName,
          status: users.status,
          isAdmin: users.isAdmin,
          address: users.address,
          createdAt: users.createdAt
          // password alanını seçmiyoruz
        });

      return updatedUser;
    } catch (error) {
      console.error("Error in updateUser:", error);
      throw new Error("Failed to update user");
    }
  }
  
  // Product operations
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));
    return product;
  }
  
  async getProducts(category?: string, search?: string): Promise<Product[]> {
    let query = db.select().from(products);
    
    if (category && category !== 'all') {
      query = query.where(eq(products.category, category));
    }
    
    // Basit arama için içerik araması yaparız
    // Daha gelişmiş aramalar için tam metin araması eklenebilir
    if (search) {
      // PostgreSQL'de ILIKE büyük/küçük harf duyarlı olmadan arama yapar
      query = query.where(
        sql`${products.name} ILIKE ${`%${search}%`} OR ${products.description} ILIKE ${`%${search}%`}`
      );
    }
    
    return query.orderBy(desc(products.createdAt));
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values({
        ...product,
        createdAt: new Date()
      })
      .returning();
    return newProduct;
  }
  
  async updateProduct(id: number, productData: Partial<Product>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set(productData)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    const result = await db
      .delete(products)
      .where(eq(products.id, id));
    return !!result;
  }
  
  // Favorites operations
  async getFavorites(userId: number): Promise<Product[]> {
    const result = await db
      .select()
      .from(favorites)
      .innerJoin(products, eq(favorites.productId, products.id))
      .where(eq(favorites.userId, userId));
    
    return result.map(row => row.products);
  }
  
  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    // Önce kontrol edelim
    const exists = await this.checkFavorite(favorite.userId, favorite.productId);
    if (exists) {
      throw new Error("Favorite already exists");
    }
    
    const [newFavorite] = await db
      .insert(favorites)
      .values(favorite)
      .returning();
    return newFavorite;
  }
  
  async removeFavorite(userId: number, productId: number): Promise<boolean> {
    const result = await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.productId, productId)
        )
      );
    return !!result;
  }
  
  async checkFavorite(userId: number, productId: number): Promise<boolean> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.productId, productId)
        )
      );
    return result.count > 0;
  }
  
  // Cart operations
  async getCartItems(userId: number): Promise<(CartItem & { product: Product })[]> {
    const result = await db
      .select()
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId));
    
    return result.map(row => ({
      ...row.cart_items,
      product: row.products
    }));
  }
  
  async addCartItem(cartItem: InsertCartItem): Promise<CartItem> {
    // Sepette zaten var mı kontrol edelim
    const existing = await this.getCartItemByUserAndProduct(cartItem.userId, cartItem.productId);
    if (existing) {
      const quantityToAdd = cartItem.quantity || 1; // Undefined ise 1 kullan
      return this.updateCartItemQuantity(existing.id, existing.quantity + quantityToAdd) as Promise<CartItem>;
    }
    
    // quantity değerini kontrol et
    const cartItemWithQuantity = {
      ...cartItem,
      quantity: cartItem.quantity || 1 // Undefined ise 1 kullan
    };
    
    const [newCartItem] = await db
      .insert(cartItems)
      .values(cartItemWithQuantity)
      .returning();
    return newCartItem;
  }
  
  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const [updatedCartItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedCartItem;
  }
  
  async removeCartItem(id: number): Promise<boolean> {
    const result = await db
      .delete(cartItems)
      .where(eq(cartItems.id, id));
    return !!result;
  }
  
  async getCartItemByUserAndProduct(userId: number, productId: number): Promise<CartItem | undefined> {
    const [cartItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, userId),
          eq(cartItems.productId, productId)
        )
      );
    return cartItem;
  }

  async getUsers(): Promise<User[]> {
    try {
      // Sadece admin olmayan kullanıcıları getir
      const result = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        fullName: users.fullName,
        status: users.status,
        address: users.address,
        createdAt: users.createdAt
      })
      .from(users)
      .where(eq(users.isAdmin, false)); // Admin olmayanları filtrele

      // Hassas bilgileri filtrele ve sonucu döndür
      return result.map(user => ({
        ...user,
        password: undefined // Şifreyi client'a gönderme
      }));

    } catch (error) {
      console.error("DatabaseStorage.getUsers error:", error);
      throw new Error("Failed to fetch users");
    }
  }
}

// Veritabanı depolama kullanarak aktif hale getir
export const storage = new DatabaseStorage();
