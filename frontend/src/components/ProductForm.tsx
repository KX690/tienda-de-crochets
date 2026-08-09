import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { NuevoProducto, Producto } from "../types/producto";
import type { Categoria } from "../types/categoria";

interface ProductFormProps {
  categorias: Categoria[];
  productoEnEdicion: Producto | null;
  onCrear: (producto: NuevoProducto) => Promise<void>;
  onActualizar: (id: number, producto: NuevoProducto) => Promise<void>;
  onCancelarEdicion: () => void;
}

const valoresIniciales: NuevoProducto = {
  nombre: "",
  descripcion: "",
  precio: 0,
  categoriaId: null,
  imagenUrl: "",
  stock: 1,
};

const productoAFormulario = (producto: Producto): NuevoProducto => ({
  nombre: producto.nombre,
  descripcion: producto.descripcion,
  precio: producto.precio,
  categoriaId: producto.categoriaId ?? null,
  imagenUrl: producto.imagenUrl ?? "",
  stock: producto.stock,
});

// Formulario para registrar o editar un llavero de crochet en el catálogo
const ProductForm = ({
  categorias,
  productoEnEdicion,
  onCrear,
  onActualizar,
  onCancelarEdicion,
}: ProductFormProps) => {
  const [form, setForm] = useState<NuevoProducto>(valoresIniciales);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagenRota, setImagenRota] = useState(false);

  useEffect(() => {
    setForm(productoEnEdicion ? productoAFormulario(productoEnEdicion) : valoresIniciales);
    setError(null);
    setImagenRota(false);
  }, [productoEnEdicion]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "categoriaId") {
      setForm((prev) => ({ ...prev, categoriaId: value ? Number(value) : null }));
      return;
    }

    if (name === "imagenUrl") {
      setImagenRota(false);
    }

    setForm((prev) => ({
      ...prev,
      [name]: name === "precio" || name === "stock" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.nombre.trim() || !form.descripcion.trim() || form.precio <= 0) {
      setError("Completa nombre, descripción y un precio válido.");
      return;
    }

    try {
      setEnviando(true);
      if (productoEnEdicion) {
        await onActualizar(productoEnEdicion.id, form);
      } else {
        await onCrear(form);
        setForm(valoresIniciales);
      }
    } catch (err) {
      setError("Ocurrió un error al guardar el llavero. Intenta nuevamente.");
      console.error(err);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <h2>{productoEnEdicion ? "Editar llavero" : "Agregar nuevo llavero"}</h2>

      <label>
        Nombre
        <input
          type="text"
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          placeholder="Ej: Llavero gatito amigurumi"
        />
      </label>

      <label>
        Descripción
        <textarea
          name="descripcion"
          value={form.descripcion}
          onChange={handleChange}
          placeholder="Ej: Tejido a mano en algodón, 6cm de alto"
        />
      </label>

      <div className="form-row">
        <label>
          Precio (Gs.)
          <input
            type="number"
            step="1000"
            min="0"
            name="precio"
            value={form.precio}
            onChange={handleChange}
            placeholder="Ej: 35000"
          />
        </label>

        <label>
          Stock
          <input
            type="number"
            name="stock"
            value={form.stock}
            onChange={handleChange}
          />
        </label>
      </div>

      <label>
        Categoría (opcional)
        <select name="categoriaId" value={form.categoriaId ?? ""} onChange={handleChange}>
          <option value="">Sin categoría</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nombre}
            </option>
          ))}
        </select>
      </label>

      <label>
        URL de imagen (opcional)
        <input
          type="text"
          name="imagenUrl"
          value={form.imagenUrl ?? ""}
          onChange={handleChange}
          placeholder="https://..."
        />
      </label>

      {form.imagenUrl && (
        <div className="image-preview">
          {imagenRota ? (
            <p className="image-preview-error">No se pudo cargar la imagen desde esa URL.</p>
          ) : (
            <img
              src={form.imagenUrl}
              alt="Vista previa del llavero"
              onError={() => setImagenRota(true)}
            />
          )}
        </div>
      )}

      {error && <p className="error">{error}</p>}

      <div className="form-actions">
        <button type="submit" disabled={enviando}>
          {enviando ? "Guardando..." : productoEnEdicion ? "Guardar cambios" : "Guardar llavero"}
        </button>
        {productoEnEdicion && (
          <button type="button" className="secundario" onClick={onCancelarEdicion}>
            Cancelar edición
          </button>
        )}
      </div>
    </form>
  );
};

export default ProductForm;
