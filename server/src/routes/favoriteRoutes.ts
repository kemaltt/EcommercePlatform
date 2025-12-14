import { Router } from "express";
import * as favoriteController from "../controllers/favoriteController";
import { isAuthenticated } from "../middleware/authMiddleware";

const router = Router();

router.use(isAuthenticated);

router.get("/", favoriteController.getFavorites);
router.post("/", favoriteController.addFavorite);
router.delete("/:productId", favoriteController.removeFavorite);
router.get("/check/:productId", favoriteController.checkFavorite);

export default router;
