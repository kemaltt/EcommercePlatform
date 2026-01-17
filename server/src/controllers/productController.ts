import { Request, Response } from "express";
import { storage } from "../../storage";
import { insertProductSchema } from "../../../shared/schema";
import { z } from "zod";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;
    const products = await storage.getProducts(category, search);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Error fetching products" });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const product = await storage.getProduct(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Error fetching product" });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const productData = insertProductSchema.parse(req.body);
    const newProduct = await storage.createProduct(productData);
    res.status(201).json(newProduct);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Invalid product data", errors: err.errors });
    }
    res.status(500).json({ message: "Error creating product" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const productData = req.body;

    const updatedProduct = await storage.updateProduct(productId, productData);

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: "Error updating product" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const success = await storage.deleteProduct(productId);

    if (!success) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: "Error deleting product" });
  }
};
