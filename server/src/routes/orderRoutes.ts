import { Router } from "express";
import {
  createOrder,
  getOrders,
  getOrder,
} from "../controllers/orderController";

const router = Router();

router.post("/", createOrder);
router.get("/", getOrders);
router.get("/:id", getOrder);

export default router;
