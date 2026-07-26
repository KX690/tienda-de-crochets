import "dotenv/config";
import app from "./app";

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor de Tienda de crochets corriendo en http://localhost:${PORT}`);
});
