import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Barra de navegación con enlaces según el estado de autenticación del usuario
const Navbar = () => {
  const { usuario, estaAutenticado, esAdmin, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  const handleCerrarSesion = () => {
    cerrarSesion();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">🧶 Tienda de crochets</div>

      <div className="navbar-links">
        <NavLink to="/" end>
          Catálogo
        </NavLink>
        {estaAutenticado && !esAdmin && <NavLink to="/pedidos">Mis pedidos</NavLink>}
        {esAdmin && <NavLink to="/admin">Panel admin</NavLink>}
      </div>

      <div className="navbar-user">
        {estaAutenticado ? (
          <>
            <span className="navbar-saludo">
              Hola, {usuario?.nombre} {esAdmin && <span className="badge">admin</span>}
            </span>
            <button type="button" className="secundario" onClick={handleCerrarSesion}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Iniciar sesión</NavLink>
            <NavLink to="/registro">Registrarse</NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
