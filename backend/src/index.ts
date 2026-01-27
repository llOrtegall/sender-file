import express from "express";
import morgan from "morgan";
import cors from "cors";

import { fileRouter } from "./routes/fileRoutes";
import { PORT, CORS_ORIGIN } from "./schema/envSchema";
import { MappingUrl } from "./models/MappingUrl";
import { pgConn } from "./config/pgConn";

const app = express();

// Middleware
app.use(
  cors({ origin: CORS_ORIGIN, optionsSuccessStatus: 200, credentials: true }),
);
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
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

pgConn
  .authenticate()
  .then(() => {
    console.log(
      "Conexión a la base de datos PostgreSQL establecida correctamente.",
    );
    return MappingUrl.sync(); // Sincroniza el modelo con la base de datos
  })
  .then(() => {
    console.log("Modelo MappingUrl sincronizado con la base de datos.");
  })
  .catch((err: Error) => {
    console.error("No se pudo conectar a la base de datos:", err);
  });
