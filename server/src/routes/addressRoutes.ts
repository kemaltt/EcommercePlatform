import { Router } from "express";
import * as addressController from "../controllers/addressController";

const router = Router();

router.get("/", addressController.getAddresses);
router.get("/:id", addressController.getAddressById);
router.post("/", addressController.createAddress);
router.patch("/:id", addressController.updateAddress);
router.delete("/:id", addressController.deleteAddress);

export default router;
