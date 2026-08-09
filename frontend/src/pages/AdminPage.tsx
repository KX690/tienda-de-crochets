import { useEffect, useState } from "react";
import ProductList from "../components/ProductList";
import ProductForm from "../components/ProductForm";
import CategoryManager from "../components/CategoryManager";
import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from "../services/productoService";
import {
  obtenerCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} from "../services/categoriaService";
import {
  obtenerTodosLosPedidos,
  actualizarEstadoPedido,
  eliminarPedido,
} from "../services/pedidoService";
import { ESTADOS_PEDIDO, ETIQUETAS_ESTADO } from "../types/pedido";
import type { EstadoPedido, Pedido } from "../types/pedido";
import type { NuevoProducto, Producto } from "../types/producto";
import type { Categoria, NuevaCategoria } from "../types/categoria";

const formatoGuarani = new Intl.NumberFormat("es-PY", {
  style: "currency",
  currency: "PYG",
  maximumFractionDigits: 0,
});

const formatoFecha = new Intl.DateTimeFormat("es-PY", {
  dateStyle: "medium",
  timeStyle: "short",
});

type Pestana = "productos" | "pedidos";

// Panel de administración: gestión del catálogo (productos/categorías) y de todos los pedidos
const AdminPage = () => {
  const [pestana, setPestana] = useState<Pestana>("pedidos");

  // --- Estado de productos y categorías ---
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoCategorias, setCargandoCategorias] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [productoEnEdicion, setProductoEnEdicion] = useState<Producto | null>(null);

  // --- Estado de pedidos ---
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | "TODOS">("TODOS");

  useEffect(() => {
    cargarProductos();
    cargarCategorias();
    cargarPedidos();
  }, []);

  const cargarProductos = async () => {
    try {
      setCargando(true);
      setErrorCarga(null);
      const data = await obtenerProductos();
      setProductos(data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      setErrorCarga("No se pudo conectar con el servidor. Verifica que el backend esté corriendo.");
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

  const cargarPedidos = async () => {
    try {
      setCargandoPedidos(true);
      const data = await obtenerTodosLosPedidos();
      setPedidos(data);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
    } finally {
      setCargandoPedidos(false);
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
    cargarProductos();
  };

  const handleEliminarCategoria = async (id: number) => {
    await eliminarCategoria(id);
    setCategorias((prev) => prev.filter((c) => c.id !== id));
    cargarProductos();
  };

  const handleCambiarEstado = async (pedido: Pedido, estado: EstadoPedido) => {
    try {
      const pedidoActualizado = await actualizarEstadoPedido(pedido.id, estado);
      setPedidos((prev) => prev.map((p) => (p.id === pedido.id ? pedidoActualizado : p)));
    } catch (error) {
      console.error("Error al actualizar el estado del pedido:", error);
      window.alert("No se pudo actualizar el estado del pedido.");
    }
  };

  const handleEliminarPedido = async (pedido: Pedido) => {
    if (!window.confirm(`¿Eliminar el pedido #${pedido.id} de ${pedido.usuario.nombre}?`)) return;

    try {
      await eliminarPedido(pedido.id);
      setPedidos((prev) => prev.filter((p) => p.id !== pedido.id));
    } catch (error) {
      console.error("Error al eliminar el pedido:", error);
      window.alert("No se pudo eliminar el pedido.");
    }
  };

  const pedidosFiltrados =
    filtroEstado === "TODOS" ? pedidos : pedidos.filter((p) => p.estado === filtroEstado);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Panel de administración</h1>
        <p>Gestioná el catálogo y los pedidos de todos los usuarios</p>
      </header>

      <div className="admin-tabs">
        <button
          type="button"
          className={pestana === "pedidos" ? "activo" : ""}
          onClick={() => setPestana("pedidos")}
        >
          Pedidos
        </button>
        <button
          type="button"
          className={pestana === "productos" ? "activo" : ""}
          onClick={() => setPestana("productos")}
        >
          Productos y categorías
        </button>
      </div>

      {pestana === "pedidos" && (
        <section className="list-section">
          <div className="pedidos-admin-header">
            <h2>Todos los pedidos</h2>
            <label className="filtro-estado">
              Filtrar por estado
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value as EstadoPedido | "TODOS")}
              >
                <option value="TODOS">Todos</option>
                {ESTADOS_PEDIDO.map((estado) => (
                  <option key={estado} value={estado}>
                    {ETIQUETAS_ESTADO[estado]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {cargandoPedidos && <p className="estado-info">Cargando pedidos...</p>}
          {!cargandoPedidos && pedidosFiltrados.length === 0 && (
            <p className="estado-info">No hay pedidos que coincidan con el filtro.</p>
          )}

          <div className="pedido-list">
            {pedidosFiltrados.map((pedido) => (
              <div className="pedido-card" key={pedido.id}>
                <div className="pedido-card-header">
                  <span>Pedido #{pedido.id}</span>
                  <span className={`estado-badge estado-${pedido.estado.toLowerCase()}`}>
                    {ETIQUETAS_ESTADO[pedido.estado]}
                  </span>
                </div>
                <p className="pedido-fecha">{formatoFecha.format(new Date(pedido.createdAt))}</p>
                <p className="descripcion">
                  Cliente: {pedido.usuario.nombre} ({pedido.usuario.email})
                </p>
                <ul className="pedido-items">
                  {pedido.items.map((item) => (
                    <li key={item.id}>
                      {item.producto.nombre} x{item.cantidad} —{" "}
                      {formatoGuarani.format(item.precioUnitario * item.cantidad)}
                    </li>
                  ))}
                </ul>
                {pedido.notas && <p className="descripcion">Notas: {pedido.notas}</p>}
                <div className="pedido-total">
                  <strong>Total: {formatoGuarani.format(pedido.total)}</strong>
                </div>
                <div className="pedido-admin-actions">
                  <label>
                    Cambiar estado
                    <select
                      value={pedido.estado}
                      onChange={(e) => handleCambiarEstado(pedido, e.target.value as EstadoPedido)}
                    >
                      {ESTADOS_PEDIDO.map((estado) => (
                        <option key={estado} value={estado}>
                          {ETIQUETAS_ESTADO[estado]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button type="button" className="peligro" onClick={() => handleEliminarPedido(pedido)}>
                    Eliminar pedido
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {pestana === "productos" && (
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
      )}
    </div>
  );
};

export default AdminPage;
