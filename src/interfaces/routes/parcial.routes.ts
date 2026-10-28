import { Router } from "express";
import { ParcialUbicacionesController } from "../controllers/ParcialUbicacionesController";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();
const controller = new ParcialUbicacionesController();

router.post("/ubicaciones", authenticateToken, (req, res) => controller.crear(req, res));
router.get("/ubicaciones", authenticateToken, (req, res) => controller.listar(req, res));

export default router;
