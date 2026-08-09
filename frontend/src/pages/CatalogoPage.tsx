import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CatalogoGrid from "../components/CatalogoGrid";
import { obtenerProductos } from "../services/productoService";
import { useAuth } from "../context/AuthContext";
import type { Producto } from "../types/producto";

// Página pública con el catálogo de llaveros de crochet
const CatalogoPage = () => {
  const { estaAutenticado, esAdmin } = useAuth();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        const data = await obtenerProductos();
        setProductos(data);
        setError(null);
      } catch (err) {
        console.error("Error al cargar productos:", err);
        setError("No se pudo conectar con el servidor. Verifica que el backend esté corriendo.");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🧶 Tienda de crochets</h1>
        <p>Llaveros artesanales tejidos a crochet</p>
        {!estaAutenticado && (
          <p className="estado-info">
            <Link to="/login">Inicia sesión</Link> para poder realizar un pedido.
          </p>
        )}
        {estaAutenticado && !esAdmin && (
          <p className="estado-info">
            <Link to="/pedidos">Armá tu pedido aquí</Link> eligiendo productos del catálogo.
          </p>
        )}
      </header>

      <main>
        {error && <p className="error">{error}</p>}
        <CatalogoGrid productos={productos} cargando={cargando} />
      </main>
    </div>
  );
};

export default CatalogoPage;
