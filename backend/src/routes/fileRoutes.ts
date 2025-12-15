import { Router } from "express";
import {
  uploadFileHandler,
  downloadFileHandler,
  listFilesHandler,
  deleteFileHandler,
  getUploadUrlHandler,
  getDownloadUrlHandler,
} from "../controllers/fileController";

export const fileRouter = Router();

/**
 * Rutas para gestionar archivos en R2
 */

// Subir archivo
fileRouter.post("/upload", uploadFileHandler);

// Obtener URL firmada para subir directo (cliente PUT a R2)
fileRouter.post("/upload-url", getUploadUrlHandler);

// Descargar archivo
fileRouter.get("/download/:fileName", downloadFileHandler);

// Obtener URL para descarga directa (cliente GET a R2)
fileRouter.get("/download-url/:fileName", getDownloadUrlHandler);

// Listar archivos
fileRouter.get("/list", listFilesHandler);

// Eliminar archivo
fileRouter.delete("/:fileName", deleteFileHandler);
