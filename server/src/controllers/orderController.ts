import { Request, Response } from "express";
import { storage } from "../../storage";
import { insertOrderSchema } from "@shared/schema";
import crypto from "crypto";

export const createOrder = async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const { items, ...orderData } = req.body;

    // Generate order number
    const orderNumber = `AG-${crypto.randomInt(100000, 999999)}`;

    const order = await storage.createOrder(
      {
        ...orderData,
        userId: req.user.id,
        orderNumber,
        status: "pending",
        paymentStatus: "paid", // For demo purposes, assume paid
      },
      items,
    );

    res.status(201).json(order);
  } catch (error: any) {
    console.error("Create order error:", error);
    res
      .status(400)
      .json({ message: error.message || "Failed to create order" });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const orders = await storage.getOrdersByUser(req.user.id);
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

export const getOrder = async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const order = await storage.getOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch order" });
  }
};
