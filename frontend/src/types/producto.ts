import type { Categoria } from "./categoria";

// Representa un llavero de crochet del catálogo de Tienda de crochets
export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoriaId?: number | null;
  categoria?: Categoria | null;
  imagenUrl?: string | null;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

// Datos que se envían al crear o actualizar un producto (sin id ni fechas ni el objeto categoria anidado)
export type NuevoProducto = Omit<Producto, "id" | "createdAt" | "updatedAt" | "categoria">;
