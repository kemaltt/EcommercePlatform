import { Request, Response } from "express";
import { storage } from "../../storage";

export const updateProfile = async (req: Request, res: Response) => {
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
};
