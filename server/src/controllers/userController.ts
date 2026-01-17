import { Request, Response } from "express";
import { storage } from "../../storage";

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { fullName, email, username, address } = req.body;

    // If email is being changed, check if it's already in use
    if (email && email !== (req.user as any).email) {
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    // If username is being changed, check if it's already in use
    if (username && username !== (req.user as any).username) {
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already in use" });
      }
    }

    const updatedUser = await storage.updateUser(userId, {
      fullName,
      email,
      username,
      address,
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
