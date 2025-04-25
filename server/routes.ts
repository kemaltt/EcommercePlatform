import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertProductSchema, insertFavoriteSchema, insertCartItemSchema, users } from "@shared/schema";
import { z } from "zod";
import { db } from "./db";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Middleware to check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    return res.status(401).json({ message: "Not authenticated" });
  };

  // Middleware to check if user is admin
  const isAdmin = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated() && req.user && req.user.isAdmin) {
      return next();
    }
    return res.status(403).json({ message: "Unauthorized: Admin access required" });
  };

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const search = req.query.search as string | undefined;
      const products = await storage.getProducts(category, search);
      res.json(products);
    } catch (err) {
      res.status(500).json({ message: "Error fetching products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (err) {
      res.status(500).json({ message: "Error fetching product" });
    }
  });

  // Admin product management routes
  app.post("/api/products", isAdmin, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const newProduct = await storage.createProduct(productData);
      res.status(201).json(newProduct);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: err.errors });
      }
      res.status(500).json({ message: "Error creating product" });
    }
  });

  app.put("/api/products/:id", isAdmin, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const productData = req.body;
      
      const updatedProduct = await storage.updateProduct(productId, productData);
      
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(updatedProduct);
    } catch (err) {
      res.status(500).json({ message: "Error updating product" });
    }
  });

  app.delete("/api/products/:id", isAdmin, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const success = await storage.deleteProduct(productId);
      
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Error deleting product" });
    }
  });

  // Favorites routes
  app.get("/api/favorites", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const favorites = await storage.getFavorites(userId);
      res.json(favorites);
    } catch (err) {
      res.status(500).json({ message: "Error fetching favorites" });
    }
  });

  app.post("/api/favorites", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { productId } = req.body;
      
      const favoriteData = insertFavoriteSchema.parse({
        userId,
        productId: parseInt(productId)
      });
      
      const favorite = await storage.addFavorite(favoriteData);
      res.status(201).json(favorite);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid favorite data", errors: err.errors });
      }
      
      if (err instanceof Error && err.message === "Favorite already exists") {
        return res.status(409).json({ message: err.message });
      }
      
      res.status(500).json({ message: "Error adding favorite" });
    }
  });

  app.delete("/api/favorites/:productId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const productId = parseInt(req.params.productId);
      
      const success = await storage.removeFavorite(userId, productId);
      
      if (!success) {
        return res.status(404).json({ message: "Favorite not found" });
      }
      
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Error removing favorite" });
    }
  });

  app.get("/api/favorites/check/:productId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const productId = parseInt(req.params.productId);
      
      const isFavorite = await storage.checkFavorite(userId, productId);
      res.json({ isFavorite });
    } catch (err) {
      res.status(500).json({ message: "Error checking favorite status" });
    }
  });

  // Cart routes
  app.get("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems);
    } catch (err) {
      res.status(500).json({ message: "Error fetching cart items" });
    }
  });

  app.post("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { productId, quantity } = req.body;
      
      const cartItemData = insertCartItemSchema.parse({
        userId,
        productId: parseInt(productId),
        quantity: parseInt(quantity) || 1
      });
      
      const cartItem = await storage.addCartItem(cartItemData);
      res.status(201).json(cartItem);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid cart data", errors: err.errors });
      }
      res.status(500).json({ message: "Error adding item to cart" });
    }
  });

  app.put("/api/cart/:id", isAuthenticated, async (req, res) => {
    try {
      const itemId = parseInt(req.params.id);
      const { quantity } = req.body;
      
      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Quantity must be at least 1" });
      }
      
      const updatedItem = await storage.updateCartItemQuantity(itemId, quantity);
      
      if (!updatedItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.json(updatedItem);
    } catch (err) {
      res.status(500).json({ message: "Error updating cart item" });
    }
  });

  app.delete("/api/cart/:id", isAuthenticated, async (req, res) => {
    try {
      const itemId = parseInt(req.params.id);
      const success = await storage.removeCartItem(itemId);
      
      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Error removing cart item" });
    }
  });

  // Admin user management routes
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const allUsers = await storage.getUsers();
      res.json(allUsers);
    } catch (err) {
      console.error("Detailed error in /api/admin/users:", {
        error: err,
        message: err instanceof Error ? err.message : "Unknown error",
        stack: err instanceof Error ? err.stack : undefined,
        timestamp: new Date().toISOString()
      });
      res.status(500).json({ 
        message: "Error fetching users",
        details: err instanceof Error ? err.message : "Unknown error"
      });
    }
  });

  app.put("/api/admin/users/:id/status", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { status } = req.body;
      
      const updatedUser = await storage.updateUser(userId, { status });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (err) {
      res.status(500).json({ message: "Error updating user status" });
    }
  });

  // User profile update
  app.put("/api/user/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { fullName, email, address } = req.body;
      
      // If email is being changed, check if it's already in use
      if (email && email !== req.user!.email) {
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser) {
          return res.status(400).json({ message: "Email already in use" });
        }
      }
      
      const updatedUser = await storage.updateUser(userId, {
        fullName,
        email,
        address
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (err) {
      res.status(500).json({ message: "Error updating profile" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
