import { Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../config/prisma";
import { generarToken } from "../utils/jwt";
import { RequestConUsuario } from "../middlewares/auth.middleware";

const SALT_ROUNDS = 10;

// Quita la contraseña antes de devolver el usuario al cliente
const sinPassword = (usuario: { password: string; [k: string]: unknown }) => {
  const { password, ...resto } = usuario;
  return resto;
};

// POST /api/auth/registro - crea una cuenta de usuario (rol USER)
export const registrar = async (req: RequestConUsuario, res: Response) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre?.trim() || !email?.trim() || !password) {
      return res
        .status(400)
        .json({ mensaje: "Los campos nombre, email y password son obligatorios" });
    }

    if (password.length < 6) {
      return res.status(400).json({ mensaje: "La contraseña debe tener al menos 6 caracteres" });
    }

    const existente = await prisma.usuario.findUnique({ where: { email: email.toLowerCase() } });
    if (existente) {
      return res.status(409).json({ mensaje: "Ya existe una cuenta registrada con ese email" });
    }

    const passwordHasheado = await bcrypt.hash(password, SALT_ROUNDS);

    const usuario = await prisma.usuario.create({
      data: {
        nombre: nombre.trim(),
        email: email.toLowerCase().trim(),
        password: passwordHasheado,
      },
    });

    const token = generarToken({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    });

    return res.status(201).json({ usuario: sinPassword(usuario), token });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return res.status(500).json({ mensaje: "Error al registrar el usuario" });
  }
};

// POST /api/auth/login - valida credenciales y emite un JWT
export const login = async (req: RequestConUsuario, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({ mensaje: "Los campos email y password son obligatorios" });
    }

    const usuario = await prisma.usuario.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!usuario) {
      return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    const token = generarToken({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    });

    return res.status(200).json({ usuario: sinPassword(usuario), token });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return res.status(500).json({ mensaje: "Error al iniciar sesión" });
  }
};

// GET /api/auth/perfil - devuelve los datos del usuario autenticado (requiere token)
export const perfil = async (req: RequestConUsuario, res: Response) => {
  try {
    const usuario = await prisma.usuario.findUnique({ where: { id: req.usuario!.id } });
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    return res.status(200).json(sinPassword(usuario));
  } catch (error) {
    console.error("Error al obtener el perfil:", error);
    return res.status(500).json({ mensaje: "Error al obtener el perfil" });
  }
};
