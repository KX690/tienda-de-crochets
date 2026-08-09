import "dotenv/config";
import bcrypt from "bcrypt";
import prisma from "../src/config/prisma";

const ADMIN_EMAIL = "kevin_lezcano@hotmail.com";
const ADMIN_PASSWORD = "admin";

// Crea (o actualiza) la cuenta de administrador fija de la tienda
async function main() {
  const passwordHasheado = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const admin = await prisma.usuario.upsert({
    where: { email: ADMIN_EMAIL },
    update: { rol: "ADMIN", password: passwordHasheado },
    create: {
      nombre: "Administrador",
      email: ADMIN_EMAIL,
      password: passwordHasheado,
      rol: "ADMIN",
    },
  });

  console.log(`Usuario administrador listo: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error("Error al ejecutar el seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
