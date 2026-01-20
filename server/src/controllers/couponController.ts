import { Request, Response } from "express";
import { storage } from "../../storage";
import { insertCouponSchema } from "../../../shared/schema";
import { z } from "zod";

export const getCoupons = async (req: Request, res: Response) => {
  try {
    const coupons = await storage.getAllCoupons();
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch coupons" });
  }
};

export const createCoupon = async (req: Request, res: Response) => {
  try {
    const couponData = insertCouponSchema.parse(req.body);
    const existing = await storage.getCouponByCode(couponData.code);
    if (existing) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    const newCoupon = await storage.createCoupon(couponData);
    res.status(201).json(newCoupon);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Invalid coupon data", errors: err.errors });
    }
    res.status(500).json({ message: "Failed to create coupon" });
  }
};

export const updateCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate if strictly needed, but for now allow partial updates directly
    // Ideally we should have a patch schema

    const updated = await storage.updateCoupon(id, updateData);
    if (!updated) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update coupon" });
  }
};

export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await storage.deleteCoupon(id);
    if (!success) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.json({ message: "Coupon deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete coupon" });
  }
};

export const validateCoupon = async (req: Request, res: Response) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const coupon = await storage.getCouponByCode(code);

    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ message: "Coupon is not active" });
    }

    if (coupon.expirationDate && new Date(coupon.expirationDate) < new Date()) {
      return res.status(400).json({ message: "Coupon has expired" });
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }

    const total = Number(cartTotal);
    if (isNaN(total)) {
      return res.status(400).json({ message: "Invalid cart total" });
    }

    if (coupon.minPurchaseAmount && total < coupon.minPurchaseAmount) {
      return res.status(400).json({
        message: `Minimum purchase amount of ${coupon.minPurchaseAmount} required`,
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (total * coupon.discountValue) / 100;
    } else {
      discountAmount = coupon.discountValue;
    }

    // Ensure discount doesn't exceed total
    if (discountAmount > total) {
      discountAmount = total;
    }

    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discountAmount,
    });
  } catch (err) {
    console.error("Validate coupon error:", err);
    res.status(500).json({ message: "Failed to validate coupon" });
  }
};
