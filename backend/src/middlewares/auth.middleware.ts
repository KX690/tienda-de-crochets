import { Request, Response, NextFunction } from "express";
import { verificarToken, PayloadToken } from "../utils/jwt";

// Extiende Request para exponer los datos del usuario autenticado a los controladores
export interface RequestConUsuario extends Request {
  usuario?: PayloadToken;
}

// Exige un token JWT válido en la cabecera Authorization: Bearer <token>
export const requiereAutenticacion = (
  req: RequestConUsuario,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ mensaje: "No se proporcionó un token de autenticación" });
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    req.usuario = verificarToken(token);
    return next();
  } catch (error) {
    return res.status(401).json({ mensaje: "Token inválido o expirado" });
  }
};

// Exige que el usuario autenticado tenga rol ADMIN. Debe usarse luego de requiereAutenticacion
export const requiereAdmin = (req: RequestConUsuario, res: Response, next: NextFunction) => {
  if (req.usuario?.rol !== "ADMIN") {
    return res.status(403).json({ mensaje: "Acceso restringido a administradores" });
  }
  return next();
};
