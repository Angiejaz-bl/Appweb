import express from "express";
import authRoutes from "./src/interfaces/routes/auth.routes";
import { config } from "./src/infrastructure/config/config";

const app = express();
app.use(express.json());

app.use("/api", authRoutes);

app.listen(config.server.port, () => {
  console.log(`Servidor corriendo en puerto ${config.server.port}`);
});
