import api from "./api";
import type { CredencialesLogin, DatosRegistro, RespuestaAuth } from "../types/usuario";

// Inicia sesión con email y contraseña
export const login = async (credenciales: CredencialesLogin): Promise<RespuestaAuth> => {
  const { data } = await api.post<RespuestaAuth>("/auth/login", credenciales);
  return data;
};

// Registra una nueva cuenta de usuario
export const registrar = async (datos: DatosRegistro): Promise<RespuestaAuth> => {
  const { data } = await api.post<RespuestaAuth>("/auth/registro", datos);
  return data;
};
