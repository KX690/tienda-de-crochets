import { Router } from "express";
import {
  getCategorias,
  getCategoriaPorId,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} from "../controllers/categoria.controller";

const router = Router();

router.get("/", getCategorias);
router.get("/:id", getCategoriaPorId);
router.post("/", crearCategoria);
router.put("/:id", actualizarCategoria);
router.delete("/:id", eliminarCategoria);

export default router;
