import express from "express";
import authRoutes from "./src/interfaces/routes/auth.routes";

const app = express();
app.use(express.json());

app.use("/api", authRoutes);

app.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000");
});
