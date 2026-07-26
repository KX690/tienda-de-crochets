import { useEffect, useState } from "react";
import ProductList from "./components/ProductList";
import ProductForm from "./components/ProductForm";
import CategoryManager from "./components/CategoryManager";
import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from "./services/productoService";
import {
  obtenerCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} from "./services/categoriaService";
import type { NuevoProducto, Producto } from "./types/producto";
import type { Categoria, NuevaCategoria } from "./types/categoria";
import "./App.css";

function App() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoCategorias, setCargandoCategorias] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [productoEnEdicion, setProductoEnEdicion] = useState<Producto | null>(null);

  useEffect(() => {
    cargarProductos();
    cargarCategorias();
  }, []);

  const cargarProductos = async () => {
    try {
      setCargando(true);
      setErrorCarga(null);
      const data = await obtenerProductos();
      setProductos(data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      setErrorCarga(
        "No se pudo conectar con el servidor. Verifica que el backend esté corriendo."
      );
    } finally {
      setCargando(false);
    }
  };

  const cargarCategorias = async () => {
    try {
      setCargandoCategorias(true);
      const data = await obtenerCategorias();
      setCategorias(data);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    } finally {
      setCargandoCategorias(false);
    }
  };

  const handleCrearProducto = async (nuevo: NuevoProducto) => {
    const productoCreado = await crearProducto(nuevo);
    setProductos((prev) => [productoCreado, ...prev]);
  };

  const handleActualizarProducto = async (id: number, datos: NuevoProducto) => {
    const productoActualizado = await actualizarProducto(id, datos);
    setProductos((prev) => prev.map((p) => (p.id === id ? productoActualizado : p)));
    setProductoEnEdicion(null);
  };

  const handleEliminarProducto = async (producto: Producto) => {
    if (!window.confirm(`¿Eliminar el llavero "${producto.nombre}"?`)) return;

    try {
      await eliminarProducto(producto.id);
      setProductos((prev) => prev.filter((p) => p.id !== producto.id));
      if (productoEnEdicion?.id === producto.id) setProductoEnEdicion(null);
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      window.alert("No se pudo eliminar el llavero.");
    }
  };

  const handleCrearCategoria = async (nueva: NuevaCategoria) => {
    const categoriaCreada = await crearCategoria(nueva);
    setCategorias((prev) => [...prev, categoriaCreada].sort((a, b) => a.nombre.localeCompare(b.nombre)));
  };

  const handleActualizarCategoria = async (id: number, datos: NuevaCategoria) => {
    const categoriaActualizada = await actualizarCategoria(id, datos);
    setCategorias((prev) =>
      prev
        .map((c) => (c.id === id ? { ...categoriaActualizada, _count: c._count } : c))
        .sort((a, b) => a.nombre.localeCompare(b.nombre))
    );
    // El nombre de la categoría puede haber cambiado: refrescamos los productos relacionados
    cargarProductos();
  };

  const handleEliminarCategoria = async (id: number) => {
    await eliminarCategoria(id);
    setCategorias((prev) => prev.filter((c) => c.id !== id));
    // Los productos asociados quedan sin categoría en el backend: refrescamos la lista
    cargarProductos();
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🧶 Tienda de crochets</h1>
        <p>Llaveros artesanales tejidos a crochet</p>
      </header>

      <main className="app-main">
        <section className="form-section">
          <ProductForm
            categorias={categorias}
            productoEnEdicion={productoEnEdicion}
            onCrear={handleCrearProducto}
            onActualizar={handleActualizarProducto}
            onCancelarEdicion={() => setProductoEnEdicion(null)}
          />

          <CategoryManager
            categorias={categorias}
            cargando={cargandoCategorias}
            onCrear={handleCrearCategoria}
            onActualizar={handleActualizarCategoria}
            onEliminar={handleEliminarCategoria}
          />
        </section>

        <section className="list-section">
          <h2>Catálogo</h2>
          {errorCarga && <p className="error">{errorCarga}</p>}
          <ProductList
            productos={productos}
            cargando={cargando}
            onEditar={setProductoEnEdicion}
            onEliminar={handleEliminarProducto}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
