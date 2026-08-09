import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import * as authService from "../services/authService";
import type { CredencialesLogin, DatosRegistro, Usuario } from "../types/usuario";

interface AuthContextValue {
  usuario: Usuario | null;
  estaAutenticado: boolean;
  esAdmin: boolean;
  cargando: boolean;
  iniciarSesion: (credenciales: CredencialesLogin) => Promise<void>;
  registrarse: (datos: DatosRegistro) => Promise<void>;
  cerrarSesion: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const leerUsuarioGuardado = (): Usuario | null => {
  const usuarioGuardado = localStorage.getItem("usuario");
  if (!usuarioGuardado) return null;
  try {
    return JSON.parse(usuarioGuardado) as Usuario;
  } catch {
    return null;
  }
};

// Provee el estado de sesión (usuario + token) a toda la aplicación
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(leerUsuarioGuardado);
  const [cargando, setCargando] = useState(false);

  const guardarSesion = (usuarioNuevo: Usuario, token: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(usuarioNuevo));
    setUsuario(usuarioNuevo);
  };

  const iniciarSesion = async (credenciales: CredencialesLogin) => {
    setCargando(true);
    try {
      const { usuario: usuarioAutenticado, token } = await authService.login(credenciales);
      guardarSesion(usuarioAutenticado, token);
    } finally {
      setCargando(false);
    }
  };

  const registrarse = async (datos: DatosRegistro) => {
    setCargando(true);
    try {
      const { usuario: usuarioCreado, token } = await authService.registrar(datos);
      guardarSesion(usuarioCreado, token);
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario,
      estaAutenticado: usuario !== null,
      esAdmin: usuario?.rol === "ADMIN",
      cargando,
      iniciarSesion,
      registrarse,
      cerrarSesion,
    }),
    [usuario, cargando]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook de acceso al contexto de autenticación
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
