import { Request, Response } from "express";
import prisma from "../config/prisma";

// GET /api/categorias - obtener todas las categorías con cantidad de productos
export const getCategorias = async (_req: Request, res: Response) => {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: { nombre: "asc" },
      include: { _count: { select: { productos: true } } },
    });
    return res.status(200).json(categorias);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    return res.status(500).json({ mensaje: "Error al obtener las categorías" });
  }
};

// GET /api/categorias/:id - obtener una categoría junto a sus productos
export const getCategoriaPorId = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const categoria = await prisma.categoria.findUnique({
      where: { id },
      include: { productos: true },
    });

    if (!categoria) {
      return res.status(404).json({ mensaje: "Categoría no encontrada" });
    }

    return res.status(200).json(categoria);
  } catch (error) {
    console.error("Error al obtener categoría:", error);
    return res.status(500).json({ mensaje: "Error al obtener la categoría" });
  }
};

// POST /api/categorias - crear una nueva categoría
export const crearCategoria = async (req: Request, res: Response) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ mensaje: "El campo nombre es obligatorio" });
    }

    const nuevaCategoria = await prisma.categoria.create({
      data: { nombre, descripcion: descripcion || null },
    });

    return res.status(201).json(nuevaCategoria);
  } catch (error: any) {
    if (error?.code === "P2002") {
      return res.status(409).json({ mensaje: "Ya existe una categoría con ese nombre" });
    }
    console.error("Error al crear categoría:", error);
    return res.status(500).json({ mensaje: "Error al crear la categoría" });
  }
};

// PUT /api/categorias/:id - actualizar una categoría existente
export const actualizarCategoria = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { nombre, descripcion } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ mensaje: "El campo nombre es obligatorio" });
    }

    const categoriaExistente = await prisma.categoria.findUnique({ where: { id } });
    if (!categoriaExistente) {
      return res.status(404).json({ mensaje: "Categoría no encontrada" });
    }

    const categoriaActualizada = await prisma.categoria.update({
      where: { id },
      data: { nombre, descripcion: descripcion || null },
    });

    return res.status(200).json(categoriaActualizada);
  } catch (error: any) {
    if (error?.code === "P2002") {
      return res.status(409).json({ mensaje: "Ya existe una categoría con ese nombre" });
    }
    console.error("Error al actualizar categoría:", error);
    return res.status(500).json({ mensaje: "Error al actualizar la categoría" });
  }
};

// DELETE /api/categorias/:id - eliminar una categoría y desasociar sus productos
export const eliminarCategoria = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const categoriaExistente = await prisma.categoria.findUnique({ where: { id } });
    if (!categoriaExistente) {
      return res.status(404).json({ mensaje: "Categoría no encontrada" });
    }

    // Los productos asociados quedan sin categoría en vez de eliminarse
    await prisma.producto.updateMany({
      where: { categoriaId: id },
      data: { categoriaId: null },
    });

    await prisma.categoria.delete({ where: { id } });

    return res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    return res.status(500).json({ mensaje: "Error al eliminar la categoría" });
  }
};
