
import { Router } from "express";
import { CensoController } from "../controllers/CensoController";
import { authenticateToken } from "../middlewares/auth.middleware";
import { authorizeRole } from "../middlewares/authorizeRole";

const router = Router();
const controller = new CensoController();

router.post(
  "/",
  authenticateToken,
  authorizeRole("CENSISTA"),
  (req, res) => controller.crear(req, res)
);


router.get(
  "/",
  authenticateToken,
  authorizeRole("ADMINISTRADOR"),
  (req, res) => controller.listar(req, res)
);

export default router;
