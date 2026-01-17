import { Router } from "express";
import * as userController from "../controllers/userController";
import { isAuthenticated } from "../middleware/authMiddleware";

const router = Router();

router.use(isAuthenticated);

router.put("/profile", userController.updateProfile);
router.post(
  "/avatar",
  userController.avatarUpload.single("avatar") as any,
  userController.uploadAvatar,
);
router.delete("/avatar", userController.deleteAvatar);

export default router;
