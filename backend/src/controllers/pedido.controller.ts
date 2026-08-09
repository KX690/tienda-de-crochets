import { Response } from "express";
import prisma from "../config/prisma";
import { RequestConUsuario } from "../middlewares/auth.middleware";

const ESTADOS_VALIDOS = ["PENDIENTE", "EN_PROCESO", "ENVIADO", "ENTREGADO", "CANCELADO"];

const includePedidoCompleto = {
  usuario: { select: { id: true, nombre: true, email: true } },
  items: { include: { producto: true } },
};

// POST /api/pedidos - el usuario autenticado crea un pedido con sus productos
export const crearPedido = async (req: RequestConUsuario, res: Response) => {
  try {
    const { items, notas } = req.body as {
      items?: { productoId: number; cantidad: number }[];
      notas?: string;
    };

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ mensaje: "El pedido debe incluir al menos un producto" });
    }

    for (const item of items) {
      if (!item.productoId || !item.cantidad || item.cantidad <= 0) {
        return res
          .status(400)
          .json({ mensaje: "Cada ítem debe tener productoId y una cantidad mayor a cero" });
      }
    }

    const productoIds = items.map((item) => Number(item.productoId));
    const productos = await prisma.producto.findMany({ where: { id: { in: productoIds } } });

    if (productos.length !== new Set(productoIds).size) {
      return res.status(404).json({ mensaje: "Uno o más productos del pedido no existen" });
    }

    for (const item of items) {
      const producto = productos.find((p) => p.id === Number(item.productoId))!;
      if (producto.stock < item.cantidad) {
        return res.status(409).json({
          mensaje: `Stock insuficiente para "${producto.nombre}" (disponible: ${producto.stock})`,
        });
      }
    }

    const total = items.reduce((acc, item) => {
      const producto = productos.find((p) => p.id === Number(item.productoId))!;
      return acc + producto.precio * item.cantidad;
    }, 0);

    const pedido = await prisma.$transaction(async (tx) => {
      const nuevoPedido = await tx.pedido.create({
        data: {
          usuarioId: req.usuario!.id,
          total,
          notas: notas?.trim() || null,
          items: {
            create: items.map((item) => {
              const producto = productos.find((p) => p.id === Number(item.productoId))!;
              return {
                productoId: producto.id,
                cantidad: item.cantidad,
                precioUnitario: producto.precio,
              };
            }),
          },
        },
        include: includePedidoCompleto,
      });

      for (const item of items) {
        await tx.producto.update({
          where: { id: Number(item.productoId) },
          data: { stock: { decrement: item.cantidad } },
        });
      }

      return nuevoPedido;
    });

    return res.status(201).json(pedido);
  } catch (error) {
    console.error("Error al crear pedido:", error);
    return res.status(500).json({ mensaje: "Error al crear el pedido" });
  }
};

// GET /api/pedidos/mios - lista los pedidos del usuario autenticado
export const misPedidos = async (req: RequestConUsuario, res: Response) => {
  try {
    const pedidos = await prisma.pedido.findMany({
      where: { usuarioId: req.usuario!.id },
      include: includePedidoCompleto,
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(pedidos);
  } catch (error) {
    console.error("Error al obtener mis pedidos:", error);
    return res.status(500).json({ mensaje: "Error al obtener los pedidos" });
  }
};

// GET /api/pedidos - (admin) lista todos los pedidos de todos los usuarios
export const obtenerTodosLosPedidos = async (req: RequestConUsuario, res: Response) => {
  try {
    const { estado } = req.query;

    const pedidos = await prisma.pedido.findMany({
      where: estado ? { estado: estado as any } : undefined,
      include: includePedidoCompleto,
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(pedidos);
  } catch (error) {
    console.error("Error al obtener los pedidos:", error);
    return res.status(500).json({ mensaje: "Error al obtener los pedidos" });
  }
};

// PATCH /api/pedidos/:id/estado - (admin) cambia el estado de un pedido
export const actualizarEstadoPedido = async (req: RequestConUsuario, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { estado } = req.body as { estado?: string };

    if (!estado || !ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({
        mensaje: `El estado debe ser uno de: ${ESTADOS_VALIDOS.join(", ")}`,
      });
    }

    const pedidoExistente = await prisma.pedido.findUnique({ where: { id } });
    if (!pedidoExistente) {
      return res.status(404).json({ mensaje: "Pedido no encontrado" });
    }

    const pedidoActualizado = await prisma.pedido.update({
      where: { id },
      data: { estado: estado as any },
      include: includePedidoCompleto,
    });

    return res.status(200).json(pedidoActualizado);
  } catch (error) {
    console.error("Error al actualizar el estado del pedido:", error);
    return res.status(500).json({ mensaje: "Error al actualizar el estado del pedido" });
  }
};

// DELETE /api/pedidos/:id - (admin) elimina un pedido
export const eliminarPedido = async (req: RequestConUsuario, res: Response) => {
  try {
    const id = Number(req.params.id);

    const pedidoExistente = await prisma.pedido.findUnique({ where: { id } });
    if (!pedidoExistente) {
      return res.status(404).json({ mensaje: "Pedido no encontrado" });
    }

    await prisma.pedido.delete({ where: { id } });

    return res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar el pedido:", error);
    return res.status(500).json({ mensaje: "Error al eliminar el pedido" });
  }
};
