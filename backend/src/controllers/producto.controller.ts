import { Request, Response } from "express";
import prisma from "../config/prisma";

// GET /api/productos - obtener todos los llaveros del catálogo (con su categoría)
export const getProductos = async (_req: Request, res: Response) => {
  try {
    const productos = await prisma.producto.findMany({
      orderBy: { createdAt: "desc" },
      include: { categoria: true },
    });
    return res.status(200).json(productos);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return res.status(500).json({ mensaje: "Error al obtener los productos" });
  }
};

// GET /api/productos/:id - obtener un llavero puntual junto a su categoría
export const getProductoPorId = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const producto = await prisma.producto.findUnique({
      where: { id },
      include: { categoria: true },
    });

    if (!producto) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    return res.status(200).json(producto);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    return res.status(500).json({ mensaje: "Error al obtener el producto" });
  }
};

// Verifica que, si se envió categoriaId, la categoría exista realmente
const validarCategoria = async (categoriaId: unknown) => {
  if (categoriaId === undefined || categoriaId === null || categoriaId === "") {
    return { valido: true, categoriaId: null as number | null };
  }

  const idNumerico = Number(categoriaId);
  const categoria = await prisma.categoria.findUnique({ where: { id: idNumerico } });

  return { valido: Boolean(categoria), categoriaId: idNumerico };
};

// POST /api/productos - crear un nuevo llavero en el catálogo
export const crearProducto = async (req: Request, res: Response) => {
  try {
    const { nombre, descripcion, precio, categoriaId, imagenUrl, stock } = req.body;

    if (!nombre || !descripcion || precio === undefined) {
      return res.status(400).json({
        mensaje: "Los campos nombre, descripcion y precio son obligatorios",
      });
    }

    const { valido, categoriaId: categoriaIdValidada } = await validarCategoria(categoriaId);
    if (!valido) {
      return res.status(404).json({ mensaje: "La categoría indicada no existe" });
    }

    const nuevoProducto = await prisma.producto.create({
      data: {
        nombre,
        descripcion,
        precio: Number(precio),
        categoriaId: categoriaIdValidada,
        imagenUrl: imagenUrl || null,
        stock: stock !== undefined ? Number(stock) : 0,
      },
      include: { categoria: true },
    });

    return res.status(201).json(nuevoProducto);
  } catch (error) {
    console.error("Error al crear producto:", error);
    return res.status(500).json({ mensaje: "Error al crear el producto" });
  }
};

// PUT /api/productos/:id - actualizar un llavero existente
export const actualizarProducto = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { nombre, descripcion, precio, categoriaId, imagenUrl, stock } = req.body;

    if (!nombre || !descripcion || precio === undefined) {
      return res.status(400).json({
        mensaje: "Los campos nombre, descripcion y precio son obligatorios",
      });
    }

    const productoExistente = await prisma.producto.findUnique({ where: { id } });
    if (!productoExistente) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    const { valido, categoriaId: categoriaIdValidada } = await validarCategoria(categoriaId);
    if (!valido) {
      return res.status(404).json({ mensaje: "La categoría indicada no existe" });
    }

    const productoActualizado = await prisma.producto.update({
      where: { id },
      data: {
        nombre,
        descripcion,
        precio: Number(precio),
        categoriaId: categoriaIdValidada,
        imagenUrl: imagenUrl || null,
        stock: stock !== undefined ? Number(stock) : 0,
      },
      include: { categoria: true },
    });

    return res.status(200).json(productoActualizado);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return res.status(500).json({ mensaje: "Error al actualizar el producto" });
  }
};

// DELETE /api/productos/:id - eliminar un llavero del catálogo
export const eliminarProducto = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const productoExistente = await prisma.producto.findUnique({ where: { id } });
    if (!productoExistente) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    await prisma.producto.delete({ where: { id } });

    return res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return res.status(500).json({ mensaje: "Error al eliminar el producto" });
  }
};
