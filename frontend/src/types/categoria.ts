// Representa una categoría del catálogo (ej: Animales, Personajes, Letras)
export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    productos: number;
  };
}

// Datos que se envían al crear o actualizar una categoría
export type NuevaCategoria = Omit<Categoria, "id" | "createdAt" | "updatedAt" | "_count">;
