import { Request, Response } from "express";
import { storage } from "../../storage";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for avatar uploads
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = (req.user as any).id;
    const uploadDir = path.join(__dirname, `../../uploads/${userId}/avatar`);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    cb(null, `avatar-${timestamp}${ext}`);
  },
});

export const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

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

export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Delete old avatar if exists
    const currentUser = req.user as any;
    if (currentUser?.avatarUrl) {
      const oldAvatarPath = path.join(
        __dirname,
        "../../uploads",
        userId.toString(),
        "avatar",
        path.basename(currentUser.avatarUrl),
      );
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Generate avatar URL
    const protocol = req.protocol;
    const host = req.get("host");
    const avatarUrl = `${protocol}://${host}/uploads/${userId}/avatar/${req.file.filename}`;

    // Update user with new avatar URL
    const updatedUser = await storage.updateUser(userId, { avatarUrl });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ avatarUrl, message: "Avatar uploaded successfully" });
  } catch (err) {
    console.error("Upload avatar error:", err);
    res.status(500).json({ message: "Error uploading avatar" });
  }
};

export const deleteAvatar = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const currentUser = req.user as any;

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete avatar file if exists
    if (currentUser.avatarUrl) {
      const avatarPath = path.join(
        __dirname,
        "../../uploads",
        userId.toString(),
        "avatar",
        path.basename(currentUser.avatarUrl),
      );
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    // Update user to remove avatar URL
    await storage.updateUser(userId, { avatarUrl: null });

    res.json({ message: "Avatar deleted successfully" });
  } catch (err) {
    console.error("Delete avatar error:", err);
    res.status(500).json({ message: "Error deleting avatar" });
  }
};
