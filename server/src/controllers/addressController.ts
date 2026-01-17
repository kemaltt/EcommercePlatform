import { Request, Response } from "express";
import { storage } from "../../storage";
import { insertAddressSchema } from "@shared/schema";

export const getAddresses = async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  const userId = (req.user as any).id;

  try {
    const addresses = await storage.getAddresses(userId);
    res.json(addresses);
  } catch (error) {
    console.error("getAddresses error:", error);
    res.status(500).send("Internal server error");
  }
};

export const getAddressById = async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  const { id } = req.params;
  const userId = (req.user as any).id;
  console.log(
    `[getAddressById] Fetching address ID: ${id} for user ID: ${userId}`,
  );

  try {
    const address = await storage.getAddress(id);
    if (!address) {
      console.log(`[getAddressById] Address ID ${id} not found`);
      return res.sendStatus(404);
    }

    if (address.userId !== userId) {
      console.log(
        `[getAddressById] Ownership mismatch: Address owner ${address.userId}, Request user ${userId}`,
      );
      return res.sendStatus(404);
    }

    console.log(`[getAddressById] Success: Found address ${address.fullName}`);
    res.json(address);
  } catch (error) {
    console.error("getAddressById error:", error);
    res.status(500).send("Internal server error");
  }
};

export const createAddress = async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  const userId = (req.user as any).id;

  try {
    const parsed = insertAddressSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }

    const addressData = {
      ...parsed.data,
      userId,
    };

    // If setting as default, unset others first if implemented in storage (DatabaseStorage handle it)
    // Actually our storage implementation doesn't handle multi-unset, we could do it here or in storage
    if (addressData.isDefault) {
      const existing = await storage.getAddresses(userId);
      for (const addr of existing) {
        if (addr.isDefault) {
          await storage.updateAddress(addr.id, { isDefault: false });
        }
      }
    }

    const address = await storage.createAddress(addressData as any);
    res.status(201).json(address);
  } catch (error) {
    console.error("createAddress error:", error);
    res.status(500).send("Internal server error");
  }
};

export const updateAddress = async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  const { id } = req.params;
  const userId = (req.user as any).id;

  try {
    const existing = await storage.getAddress(id);
    if (!existing || existing.userId !== userId) {
      return res.sendStatus(404);
    }

    const parsed = insertAddressSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }

    if (parsed.data.isDefault) {
      const userAddresses = await storage.getAddresses(userId);
      for (const addr of userAddresses) {
        if (addr.isDefault && addr.id !== id) {
          await storage.updateAddress(addr.id, { isDefault: false });
        }
      }
    }

    const updated = await storage.updateAddress(id, parsed.data);
    res.json(updated);
  } catch (error) {
    console.error("updateAddress error:", error);
    res.status(500).send("Internal server error");
  }
};

export const deleteAddress = async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  const { id } = req.params;
  const userId = (req.user as any).id;

  try {
    const existing = await storage.getAddress(id);
    if (!existing || existing.userId !== userId) {
      return res.sendStatus(404);
    }

    await storage.deleteAddress(id);
    res.sendStatus(204);
  } catch (error) {
    console.error("deleteAddress error:", error);
    res.status(500).send("Internal server error");
  }
};
