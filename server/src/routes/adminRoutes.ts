import { Router } from "express";
import * as adminController from "../controllers/adminController";
import { isAdmin } from "../middleware/authMiddleware";

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

export default router;
