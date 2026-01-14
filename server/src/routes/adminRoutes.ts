import { Router } from "express";
import * as adminController from "../controllers/adminController";
import { isAdmin } from "../middleware/authMiddleware";

const router = Router();

router.use(isAdmin);

router.get("/stats", adminController.getStats);
router.get("/users", adminController.getAllUsers);
router.put("/users/:id/status", adminController.updateUserStatus);

export default router;
