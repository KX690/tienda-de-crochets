import api from "./api";
import type { NuevoProducto, Producto } from "../types/producto";

// Obtiene el listado completo de llaveros del catálogo
export const obtenerProductos = async (): Promise<Producto[]> => {
  const { data } = await api.get<Producto[]>("/productos");
  return data;
};

// Crea un nuevo llavero en el catálogo
export const crearProducto = async (producto: NuevoProducto): Promise<Producto> => {
  const { data } = await api.post<Producto>("/productos", producto);
  return data;
};

// Actualiza un llavero existente del catálogo
export const actualizarProducto = async (
  id: number,
  producto: NuevoProducto
): Promise<Producto> => {
  const { data } = await api.put<Producto>(`/productos/${id}`, producto);
  return data;
};

// Elimina un llavero del catálogo
export const eliminarProducto = async (id: number): Promise<void> => {
  await api.delete(`/productos/${id}`);
};
