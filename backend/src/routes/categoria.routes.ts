import { Router } from "express";
import {
  getCategorias,
  getCategoriaPorId,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} from "../controllers/categoria.controller";
import { requiereAutenticacion, requiereAdmin } from "../middlewares/auth.middleware";

const router = Router();

// El catálogo de categorías es de lectura pública
router.get("/", getCategorias);
router.get("/:id", getCategoriaPorId);

// Solo un administrador puede modificar las categorías
router.post("/", requiereAutenticacion, requiereAdmin, crearCategoria);
router.put("/:id", requiereAutenticacion, requiereAdmin, actualizarCategoria);
router.delete("/:id", requiereAutenticacion, requiereAdmin, eliminarCategoria);

export default router;
