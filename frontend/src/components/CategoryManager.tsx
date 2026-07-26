import { useState } from "react";
import type { FormEvent } from "react";
import type { Categoria, NuevaCategoria } from "../types/categoria";

interface CategoryManagerProps {
  categorias: Categoria[];
  cargando: boolean;
  onCrear: (categoria: NuevaCategoria) => Promise<void>;
  onActualizar: (id: number, categoria: NuevaCategoria) => Promise<void>;
  onEliminar: (id: number) => Promise<void>;
}

const valoresIniciales: NuevaCategoria = { nombre: "", descripcion: "" };

// Administra las categorías del catálogo: alta, edición y eliminación
const CategoryManager = ({
  categorias,
  cargando,
  onCrear,
  onActualizar,
  onEliminar,
}: CategoryManagerProps) => {
  const [form, setForm] = useState<NuevaCategoria>(valoresIniciales);
  const [categoriaEnEdicionId, setCategoriaEnEdicionId] = useState<number | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditar = (categoria: Categoria) => {
    setCategoriaEnEdicionId(categoria.id);
    setForm({ nombre: categoria.nombre, descripcion: categoria.descripcion ?? "" });
    setError(null);
  };

  const handleCancelar = () => {
    setCategoriaEnEdicionId(null);
    setForm(valoresIniciales);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.nombre.trim()) {
      setError("El nombre de la categoría es obligatorio.");
      return;
    }

    try {
      setEnviando(true);
      if (categoriaEnEdicionId !== null) {
        await onActualizar(categoriaEnEdicionId, form);
      } else {
        await onCrear(form);
      }
      setForm(valoresIniciales);
      setCategoriaEnEdicionId(null);
    } catch (err) {
      setError("Ocurrió un error al guardar la categoría. Intenta nuevamente.");
      console.error(err);
    } finally {
      setEnviando(false);
    }
  };

  const handleEliminar = async (categoria: Categoria) => {
    const cantidadProductos = categoria._count?.productos ?? 0;
    const confirmMsg =
      cantidadProductos > 0
        ? `"${categoria.nombre}" tiene ${cantidadProductos} producto(s) asociado(s), que quedarán sin categoría. ¿Eliminar de todas formas?`
        : `¿Eliminar la categoría "${categoria.nombre}"?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await onEliminar(categoria.id);
      if (categoriaEnEdicionId === categoria.id) handleCancelar();
    } catch (err) {
      console.error(err);
      window.alert("No se pudo eliminar la categoría.");
    }
  };

  return (
    <div className="category-manager">
      <form className="category-form" onSubmit={handleSubmit}>
        <h2>{categoriaEnEdicionId !== null ? "Editar categoría" : "Nueva categoría"}</h2>

        <label>
          Nombre
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ej: Animales"
          />
        </label>

        <label>
          Descripción (opcional)
          <input
            type="text"
            name="descripcion"
            value={form.descripcion ?? ""}
            onChange={handleChange}
            placeholder="Ej: Llaveros con forma de animales"
          />
        </label>

        {error && <p className="error">{error}</p>}

        <div className="category-form-actions">
          <button type="submit" disabled={enviando}>
            {enviando ? "Guardando..." : categoriaEnEdicionId !== null ? "Guardar cambios" : "Agregar categoría"}
          </button>
          {categoriaEnEdicionId !== null && (
            <button type="button" className="secundario" onClick={handleCancelar}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="category-list">
        {cargando && <p className="estado-info">Cargando categorías...</p>}
        {!cargando && categorias.length === 0 && (
          <p className="estado-info">Todavía no hay categorías registradas.</p>
        )}
        {categorias.map((categoria) => (
          <div className="category-item" key={categoria.id}>
            <div>
              <strong>{categoria.nombre}</strong>{" "}
              <span className="category-count">
                ({categoria._count?.productos ?? 0} producto
                {categoria._count?.productos === 1 ? "" : "s"})
              </span>
              {categoria.descripcion && <p className="descripcion">{categoria.descripcion}</p>}
            </div>
            <div className="category-item-actions">
              <button type="button" onClick={() => handleEditar(categoria)}>
                Editar
              </button>
              <button type="button" className="peligro" onClick={() => handleEliminar(categoria)}>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryManager;
