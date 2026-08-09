import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "clave_secreta_desarrollo_tienda_de_crochets";
const JWT_EXPIRES_IN = "8h";

export interface PayloadToken {
  id: number;
  nombre: string;
  email: string;
  rol: "USER" | "ADMIN";
}

// Genera un token JWT firmado con los datos básicos del usuario autenticado
export const generarToken = (payload: PayloadToken): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Verifica la firma y vigencia del token, devolviendo el payload si es válido
export const verificarToken = (token: string): PayloadToken => {
  return jwt.verify(token, JWT_SECRET) as PayloadToken;
};
