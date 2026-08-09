import { Router } from "express";
import {
  getProductos,
  getProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from "../controllers/producto.controller";
import { requiereAutenticacion, requiereAdmin } from "../middlewares/auth.middleware";

const router = Router();

// El catálogo es de lectura pública
router.get("/", getProductos);
router.get("/:id", getProductoPorId);

// Solo un administrador puede modificar el catálogo
router.post("/", requiereAutenticacion, requiereAdmin, crearProducto);
router.put("/:id", requiereAutenticacion, requiereAdmin, actualizarProducto);
router.delete("/:id", requiereAutenticacion, requiereAdmin, eliminarProducto);

export default router;
