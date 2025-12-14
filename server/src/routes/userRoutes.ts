import { Router } from "express";
import * as userController from "../controllers/userController";
import { isAuthenticated } from "../middleware/authMiddleware";

const router = Router();

router.use(isAuthenticated);

router.put("/profile", userController.updateProfile);

export default router;
