import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { obtenerProductos } from "../services/productoService";
import { crearPedido, obtenerMisPedidos } from "../services/pedidoService";
import { ETIQUETAS_ESTADO } from "../types/pedido";
import type { Pedido } from "../types/pedido";
import type { Producto } from "../types/producto";

const formatoGuarani = new Intl.NumberFormat("es-PY", {
  style: "currency",
  currency: "PYG",
  maximumFractionDigits: 0,
});

const formatoFecha = new Intl.DateTimeFormat("es-PY", {
  dateStyle: "medium",
  timeStyle: "short",
});

interface ItemCarrito {
  productoId: number;
  cantidad: number;
}

// Página para que un usuario autenticado arme un pedido y consulte su historial
const PedidosPage = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargandoProductos, setCargandoProductos] = useState(true);
  const [cargandoPedidos, setCargandoPedidos] = useState(true);

  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<number | "">("");
  const [cantidad, setCantidad] = useState(1);
  const [notas, setNotas] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  useEffect(() => {
    cargarProductos();
    cargarMisPedidos();
  }, []);

  const cargarProductos = async () => {
    try {
      setCargandoProductos(true);
      const data = await obtenerProductos();
      setProductos(data);
    } catch (err) {
      console.error("Error al cargar productos:", err);
    } finally {
      setCargandoProductos(false);
    }
  };

  const cargarMisPedidos = async () => {
    try {
      setCargandoPedidos(true);
      const data = await obtenerMisPedidos();
      setPedidos(data);
    } catch (err) {
      console.error("Error al cargar mis pedidos:", err);
    } finally {
      setCargandoPedidos(false);
    }
  };

  const agregarAlCarrito = () => {
    if (!productoSeleccionado || cantidad <= 0) return;

    setCarrito((prev) => {
      const existente = prev.find((item) => item.productoId === productoSeleccionado);
      if (existente) {
        return prev.map((item) =>
          item.productoId === productoSeleccionado
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      }
      return [...prev, { productoId: productoSeleccionado as number, cantidad }];
    });
    setProductoSeleccionado("");
    setCantidad(1);
  };

  const quitarDelCarrito = (productoId: number) => {
    setCarrito((prev) => prev.filter((item) => item.productoId !== productoId));
  };

  const totalCarrito = carrito.reduce((acc, item) => {
    const producto = productos.find((p) => p.id === item.productoId);
    return acc + (producto ? producto.precio * item.cantidad : 0);
  }, 0);

  const handleConfirmarPedido = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMensajeExito(null);

    if (carrito.length === 0) {
      setError("Agrega al menos un producto antes de confirmar el pedido.");
      return;
    }

    try {
      setEnviando(true);
      await crearPedido({ items: carrito, notas: notas.trim() || undefined });
      setCarrito([]);
      setNotas("");
      setMensajeExito("¡Tu pedido fue creado con éxito!");
      cargarMisPedidos();
      cargarProductos();
    } catch (err) {
      const mensaje =
        (err as { response?: { data?: { mensaje?: string } } })?.response?.data?.mensaje ??
        "No se pudo crear el pedido.";
      setError(mensaje);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Mis pedidos</h1>
        <p>Armá tu pedido eligiendo productos del catálogo</p>
      </header>

      <main className="app-main">
        <section className="form-section">
          <form className="product-form" onSubmit={handleConfirmarPedido}>
            <h2>Nuevo pedido</h2>

            <label>
              Producto
              <select
                value={productoSeleccionado}
                onChange={(e) =>
                  setProductoSeleccionado(e.target.value ? Number(e.target.value) : "")
                }
                disabled={cargandoProductos}
              >
                <option value="">Selecciona un producto</option>
                {productos.map((producto) => (
                  <option key={producto.id} value={producto.id} disabled={producto.stock <= 0}>
                    {producto.nombre} — {formatoGuarani.format(producto.precio)}
                    {producto.stock <= 0 ? " (sin stock)" : ""}
                  </option>
                ))}
              </select>
            </label>

            <div className="form-row">
              <label>
                Cantidad
                <input
                  type="number"
                  min="1"
                  value={cantidad}
                  onChange={(e) => setCantidad(Number(e.target.value))}
                />
              </label>
            </div>

            <button type="button" className="secundario" onClick={agregarAlCarrito}>
              Agregar al pedido
            </button>

            {carrito.length > 0 && (
              <div className="carrito-lista">
                {carrito.map((item) => {
                  const producto = productos.find((p) => p.id === item.productoId);
                  if (!producto) return null;
                  return (
                    <div className="carrito-item" key={item.productoId}>
                      <span>
                        {producto.nombre} x{item.cantidad}
                      </span>
                      <span>{formatoGuarani.format(producto.precio * item.cantidad)}</span>
                      <button
                        type="button"
                        className="peligro"
                        onClick={() => quitarDelCarrito(item.productoId)}
                      >
                        Quitar
                      </button>
                    </div>
                  );
                })}
                <div className="carrito-total">
                  <strong>Total</strong>
                  <strong>{formatoGuarani.format(totalCarrito)}</strong>
                </div>
              </div>
            )}

            <label>
              Notas (opcional)
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Ej: entregar por la tarde"
              />
            </label>

            {error && <p className="error">{error}</p>}
            {mensajeExito && <p className="exito">{mensajeExito}</p>}

            <button type="submit" disabled={enviando || carrito.length === 0}>
              {enviando ? "Enviando..." : "Confirmar pedido"}
            </button>
          </form>
        </section>

        <section className="list-section">
          <h2>Historial de mis pedidos</h2>

          {cargandoPedidos && <p className="estado-info">Cargando pedidos...</p>}
          {!cargandoPedidos && pedidos.length === 0 && (
            <p className="estado-info">Todavía no has realizado ningún pedido.</p>
          )}

          <div className="pedido-list">
            {pedidos.map((pedido) => (
              <div className="pedido-card" key={pedido.id}>
                <div className="pedido-card-header">
                  <span>Pedido #{pedido.id}</span>
                  <span className={`estado-badge estado-${pedido.estado.toLowerCase()}`}>
                    {ETIQUETAS_ESTADO[pedido.estado]}
                  </span>
                </div>
                <p className="pedido-fecha">{formatoFecha.format(new Date(pedido.createdAt))}</p>
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
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default PedidosPage;
