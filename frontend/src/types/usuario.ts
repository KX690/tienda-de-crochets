// Roles posibles de un usuario dentro de la tienda
export type RolUsuario = "USER" | "ADMIN";

// Representa al usuario autenticado (sin la contraseña)
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: RolUsuario;
  createdAt: string;
  updatedAt: string;
}

export interface CredencialesLogin {
  email: string;
  password: string;
}

export interface DatosRegistro {
  nombre: string;
  email: string;
  password: string;
}

// Respuesta del backend al iniciar sesión o registrarse
export interface RespuestaAuth {
  usuario: Usuario;
  token: string;
}
