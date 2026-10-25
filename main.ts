
import express from "express";
import authRoutes from "./src/interfaces/routes/auth.routes";
import censoRoutes from "./src/interfaces/routes/censo.routes";
import usersRoutes from "./src/interfaces/routes/users.routes";
import { config } from "./src/infrastructure/config/config";

const app = express();

app.use(express.json());

app.use("/api", authRoutes);
app.use("/api/censos", censoRoutes);
app.use("/api/users", usersRoutes);

app.listen(config.server.port, () => {
  console.log(`Servidor corriendo en puerto ${config.server.port}`);
});
