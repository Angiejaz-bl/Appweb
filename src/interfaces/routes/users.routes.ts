import { Router } from "express";
import { UsersController } from "../controllers/UsersController";
import { authenticateToken } from "../middlewares/auth.middleware";
import { authorizeRole } from "../middlewares/authorizeRole";

const router = Router();
const controller = new UsersController();
router.use(authenticateToken, authorizeRole("ADMINISTRADOR"));
router.get("/", (req, res) => controller.listar(req, res));
router.post("/", (req, res) => controller.crear(req, res));
router.put("/:id", (req, res) => controller.actualizar(req, res));

export default router;
