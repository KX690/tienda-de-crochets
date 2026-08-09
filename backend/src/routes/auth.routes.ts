import { Router } from "express";
import { registrar, login, perfil } from "../controllers/auth.controller";
import { requiereAutenticacion } from "../middlewares/auth.middleware";

const router = Router();

router.post("/registro", registrar);
router.post("/login", login);
router.get("/perfil", requiereAutenticacion, perfil);

export default router;
