import { Router } from "express";
import * as adminController from "../controllers/adminController";
import { isAdmin } from "../middleware/authMiddleware";
import * as couponController from "../controllers/couponController";

const router = Router();

router.use(isAdmin);

router.get("/stats", adminController.getStats);
router.get("/users", adminController.getAllUsers);
router.get("/orders", adminController.getAllOrders);
router.get("/orders/:id", adminController.getOrderDetails);
router.patch("/orders/:id/status", adminController.updateOrderStatus);
router.get("/users/:id", adminController.getUser);
router.patch("/users/:id", adminController.updateUser);
router.post("/users/:id/delete", adminController.deleteUser);

// Coupon Routes
router.get("/coupons", couponController.getCoupons);
router.post("/coupons", couponController.createCoupon);
router.patch("/coupons/:id", couponController.updateCoupon);
router.delete("/coupons/:id", couponController.deleteCoupon);

export default router;
