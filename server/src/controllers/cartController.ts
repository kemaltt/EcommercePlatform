import { Request, Response } from "express";
import { storage } from "../../storage";
import { insertCartItemSchema } from "@shared/schema";
import { z } from "zod";

export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const cartItems = await storage.getCartItems(userId);
    res.json(cartItems);
  } catch (err) {
    res.status(500).json({ message: "Error fetching cart items" });
  }
};

export const addToCart = async (req: Request, res: Response) => {
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
};

export const updateCartItem = async (req: Request, res: Response) => {
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
};

export const removeCartItem = async (req: Request, res: Response) => {
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
};
