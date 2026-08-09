import api from "./api";
import type { EstadoPedido, NuevoPedido, Pedido } from "../types/pedido";

// Crea un nuevo pedido para el usuario autenticado
export const crearPedido = async (pedido: NuevoPedido): Promise<Pedido> => {
  const { data } = await api.post<Pedido>("/pedidos", pedido);
  return data;
};

// Obtiene los pedidos del usuario autenticado
export const obtenerMisPedidos = async (): Promise<Pedido[]> => {
  const { data } = await api.get<Pedido[]>("/pedidos/mios");
  return data;
};

// (Admin) Obtiene los pedidos de todos los usuarios
export const obtenerTodosLosPedidos = async (): Promise<Pedido[]> => {
  const { data } = await api.get<Pedido[]>("/pedidos");
  return data;
};

// (Admin) Cambia el estado de un pedido
export const actualizarEstadoPedido = async (
  id: number,
  estado: EstadoPedido
): Promise<Pedido> => {
  const { data } = await api.patch<Pedido>(`/pedidos/${id}/estado`, { estado });
  return data;
};

// (Admin) Elimina un pedido
export const eliminarPedido = async (id: number): Promise<void> => {
  await api.delete(`/pedidos/${id}`);
};
