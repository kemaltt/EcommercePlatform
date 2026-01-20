import { Router } from "express";
import * as cartController from "../controllers/cartController";
import * as couponController from "../controllers/couponController";
import { isAuthenticated } from "../middleware/authMiddleware";

const router = Router();

router.use(isAuthenticated);

router.get("/", cartController.getCart);
router.post("/", cartController.addToCart);
router.put("/:id", cartController.updateCartItem);
router.delete("/:id", cartController.removeCartItem);
router.delete("/", cartController.clearCart);
router.post("/validate-coupon", couponController.validateCoupon);

export default router;
