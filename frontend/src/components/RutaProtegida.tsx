import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface RutaProtegidaProps {
  children: ReactNode;
  soloAdmin?: boolean;
}

// Restringe el acceso a rutas que requieren sesión iniciada (y opcionalmente rol admin)
const RutaProtegida = ({ children, soloAdmin = false }: RutaProtegidaProps) => {
  const { estaAutenticado, esAdmin } = useAuth();

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  if (soloAdmin && !esAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default RutaProtegida;
