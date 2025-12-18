import express from "express";
import morgan from "morgan";
import cors from "cors";

import { fileRouter } from "./routes/fileRoutes";
import { PORT } from "./config/envSchema";

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:5173/" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Rutas de archivos
app.use("/api/v1/files", fileRouter);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📝 Documentación: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});
