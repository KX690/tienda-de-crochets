import api from "./api";
import type { Categoria, NuevaCategoria } from "../types/categoria";

// Obtiene el listado completo de categorías
export const obtenerCategorias = async (): Promise<Categoria[]> => {
  const { data } = await api.get<Categoria[]>("/categorias");
  return data;
};

// Crea una nueva categoría
export const crearCategoria = async (categoria: NuevaCategoria): Promise<Categoria> => {
  const { data } = await api.post<Categoria>("/categorias", categoria);
  return data;
};

// Actualiza una categoría existente
export const actualizarCategoria = async (
  id: number,
  categoria: NuevaCategoria
): Promise<Categoria> => {
  const { data } = await api.put<Categoria>(`/categorias/${id}`, categoria);
  return data;
};

// Elimina una categoría (sus productos quedan sin categoría asignada)
export const eliminarCategoria = async (id: number): Promise<void> => {
  await api.delete(`/categorias/${id}`);
};
