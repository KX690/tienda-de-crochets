import type { Producto } from "./producto";

export type EstadoPedido = "PENDIENTE" | "EN_PROCESO" | "ENVIADO" | "ENTREGADO" | "CANCELADO";

export const ESTADOS_PEDIDO: EstadoPedido[] = [
  "PENDIENTE",
  "EN_PROCESO",
  "ENVIADO",
  "ENTREGADO",
  "CANCELADO",
];

export const ETIQUETAS_ESTADO: Record<EstadoPedido, string> = {
  PENDIENTE: "Pendiente",
  EN_PROCESO: "En proceso",
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export interface PedidoItem {
  id: number;
  productoId: number;
  producto: Producto;
  cantidad: number;
  precioUnitario: number;
}

export interface Pedido {
  id: number;
  usuarioId: number;
  usuario: { id: number; nombre: string; email: string };
  estado: EstadoPedido;
  total: number;
  notas?: string | null;
  items: PedidoItem[];
  createdAt: string;
  updatedAt: string;
}

// Datos que se envían para crear un pedido nuevo
export interface NuevoPedidoItem {
  productoId: number;
  cantidad: number;
}

export interface NuevoPedido {
  items: NuevoPedidoItem[];
  notas?: string;
}
