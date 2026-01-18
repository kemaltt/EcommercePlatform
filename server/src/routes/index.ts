import { Router } from "express";
import authRoutes from "./authRoutes";
import productRoutes from "./productRoutes";
import cartRoutes from "./cartRoutes";
import favoriteRoutes from "./favoriteRoutes";
import adminRoutes from "./adminRoutes";
import userRoutes from "./userRoutes";
import addressRoutes from "./addressRoutes";
import orderRoutes from "./orderRoutes";
import * as authController from "../controllers/authController";

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);
router.use("/favorites", favoriteRoutes);
router.use("/admin", adminRoutes);
router.use("/user", userRoutes);
router.use("/addresses", addressRoutes);
router.use("/orders", orderRoutes);

// Mount verify-email at root level or specific path as needed by frontend/email link
// Original was app.get('/verify-email')
router.get("/verify-email", authController.verifyEmail);

export default router;
