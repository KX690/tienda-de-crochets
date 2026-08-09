import { Router } from "express";
import {
  crearPedido,
  misPedidos,
  obtenerTodosLosPedidos,
  actualizarEstadoPedido,
  eliminarPedido,
} from "../controllers/pedido.controller";
import { requiereAutenticacion, requiereAdmin } from "../middlewares/auth.middleware";

const router = Router();

// Rutas de usuario autenticado
router.post("/", requiereAutenticacion, crearPedido);
router.get("/mios", requiereAutenticacion, misPedidos);

// Rutas exclusivas de administrador
router.get("/", requiereAutenticacion, requiereAdmin, obtenerTodosLosPedidos);
router.patch("/:id/estado", requiereAutenticacion, requiereAdmin, actualizarEstadoPedido);
router.delete("/:id", requiereAutenticacion, requiereAdmin, eliminarPedido);

export default router;
