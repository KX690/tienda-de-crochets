import { useState } from "react";
import type { Producto } from "../types/producto";
import ImageLightbox from "./ImageLightbox";

interface ProductListProps {
  productos: Producto[];
  cargando: boolean;
  onEditar: (producto: Producto) => void;
  onEliminar: (producto: Producto) => void;
}

const formatoGuarani = new Intl.NumberFormat("es-PY", {
  style: "currency",
  currency: "PYG",
  maximumFractionDigits: 0,
});

// Muestra el catálogo de llaveros de crochet en formato de tarjetas
const ProductList = ({ productos, cargando, onEditar, onEliminar }: ProductListProps) => {
  const [productoAmpliado, setProductoAmpliado] = useState<Producto | null>(null);

  if (cargando) {
    return <p className="estado-info">Cargando catálogo...</p>;
  }

  if (productos.length === 0) {
    return <p className="estado-info">Todavía no hay llaveros registrados en el catálogo.</p>;
  }

  return (
    <div className="product-list">
      {productos.map((producto) => (
        <div className="product-card" key={producto.id}>
          <div
            className={`product-card-img${producto.imagenUrl ? " ampliable" : ""}`}
            onClick={() => producto.imagenUrl && setProductoAmpliado(producto)}
          >
            {producto.imagenUrl ? (
              <img src={producto.imagenUrl} alt={producto.nombre} />
            ) : (
              <span>🧶</span>
            )}
          </div>
          <div className="product-card-body">
            <h3>{producto.nombre}</h3>
            <p className="descripcion">{producto.descripcion}</p>
            {producto.categoria && <span className="badge">{producto.categoria.nombre}</span>}
            <div className="product-card-footer">
              <span className="precio">{formatoGuarani.format(producto.precio)}</span>
              <span className="stock">Stock: {producto.stock}</span>
            </div>
            <div className="product-card-actions">
              <button type="button" onClick={() => onEditar(producto)}>
                Editar
              </button>
              <button type="button" className="peligro" onClick={() => onEliminar(producto)}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      ))}

      {productoAmpliado?.imagenUrl && (
        <ImageLightbox
          src={productoAmpliado.imagenUrl}
          alt={productoAmpliado.nombre}
          onClose={() => setProductoAmpliado(null)}
        />
      )}
    </div>
  );
};

export default ProductList;
