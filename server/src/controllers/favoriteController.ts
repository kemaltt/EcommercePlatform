import { Request, Response } from "express";
import { storage } from "../../storage";
import { insertFavoriteSchema } from "@shared/schema";
import { z } from "zod";

export const getFavorites = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const favorites = await storage.getFavorites(userId);
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ message: "Error fetching favorites" });
  }
};

export const addFavorite = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { productId } = req.body;

    const favoriteData = insertFavoriteSchema.parse({
      userId,
      productId: parseInt(productId),
    });

    const favorite = await storage.addFavorite(favoriteData);
    res.status(201).json(favorite);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Invalid favorite data", errors: err.errors });
    }

    if (err instanceof Error && err.message === "Favorite already exists") {
      return res.status(409).json({ message: err.message });
    }

    res.status(500).json({ message: "Error adding favorite" });
  }
};

export const removeFavorite = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const productId = parseInt(req.params.productId);

    const success = await storage.removeFavorite(userId, productId);

    if (!success) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: "Error removing favorite" });
  }
};

export const checkFavorite = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const productId = parseInt(req.params.productId);

    const isFavorite = await storage.checkFavorite(userId, productId);
    res.json({ isFavorite });
  } catch (err) {
    res.status(500).json({ message: "Error checking favorite status" });
  }
};
