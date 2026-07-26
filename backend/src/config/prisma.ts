import { PrismaClient } from "@prisma/client";

// Instancia única de Prisma Client para toda la aplicación
const prisma = new PrismaClient();

export default prisma;
