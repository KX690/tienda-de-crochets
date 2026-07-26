import express from "express";
import cors from "cors";
import productoRoutes from "./routes/producto.routes";
import categoriaRoutes from "./routes/categoria.routes";

const app = express();

app.use(cors());
app.use(express.json());

// Ruta de verificación rápida
app.get("/", (_req, res) => {
  res.json({ mensaje: "API de Tienda de crochets funcionando correctamente 🧶" });
});

app.use("/api/productos", productoRoutes);
app.use("/api/categorias", categoriaRoutes);

export default app;
