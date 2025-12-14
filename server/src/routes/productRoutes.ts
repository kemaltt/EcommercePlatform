import { Router } from "express";
import * as productController from "../controllers/productController";
import { isAdmin } from "../middleware/authMiddleware";

const router = Router();

router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);
router.post("/", isAdmin, productController.createProduct);
router.put("/:id", isAdmin, productController.updateProduct);
router.delete("/:id", isAdmin, productController.deleteProduct);

export default router;
