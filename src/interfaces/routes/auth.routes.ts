import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { authenticateToken } from "../middlewares/auth.middleware";
import { profilePhotoUpload } from "../middlewares/profilePhoto.middleware";

const router = Router();
const controller = new AuthController();

router.post("/login", (req, res) => controller.login(req, res));
router.post("/register", (req, res) => controller.register(req, res));
router.get("/profile", authenticateToken, (req, res) => controller.profile(req, res));
router.post("/profile/photo", authenticateToken, profilePhotoUpload, (req, res) => controller.updatePhoto(req, res));

export default router;
