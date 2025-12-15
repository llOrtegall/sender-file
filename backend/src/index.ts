import express, { Request, Response } from "express";
import { fileRouter } from "./routes/fileRoutes";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === "production" 
    ? [process.env.ALLOWED_ORIGINS || "https://tudominio.com"]
    : ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Rutas de salud
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "API R2 funcionando correctamente",
    version: "1.0.0",
    endpoints: {
      upload: "POST /api/files/upload",
      download: "GET /api/files/download/:fileName",
      list: "GET /api/files/list",
      delete: "DELETE /api/files/:fileName",
    },
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Rutas de archivos
app.use("/api/v1/files", fileRouter);

// Manejo de rutas no encontradas
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Ruta no encontrada",
  });
});

// Manejo de errores
app.use(
  (
    err: any,
    req: Request,
    res: Response,
    next: (err?: any) => void
  ) => {
    console.error("Error:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Error interno del servidor",
    });
  }
);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📝 Documentación: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});
