import express from "express";
import cors from "cors";
import productoRoutes from "./routes/producto.routes";
import categoriaRoutes from "./routes/categoria.routes";
import authRoutes from "./routes/auth.routes";
import pedidoRoutes from "./routes/pedido.routes";

const app = express();

app.use(cors());
app.use(express.json());

// Ruta de verificación rápida
app.get("/", (_req, res) => {
  res.json({ mensaje: "API de Tienda de crochets funcionando correctamente 🧶" });
});

app.use("/api/productos", productoRoutes);
app.use("/api/categorias", categoriaRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/pedidos", pedidoRoutes);

export default app;
