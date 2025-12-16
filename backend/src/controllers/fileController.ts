import { Request, Response } from "express";
import multer, { Multer } from "multer";
import { r2Config } from "../config/r2";
import {
  getUploadPresignedUrl,
  searchFiles,
} from "../services/r2Service";

// Configurar multer para manejo de uploads en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: r2Config.maxFileSize,
  },
  fileFilter: (req, file, cb) => {
    const fileExtension = file.originalname.split(".").pop()?.toLowerCase();

    if (!fileExtension || !r2Config.allowedTypes.includes(fileExtension)) {
      cb(
        new Error(
          `Tipo de archivo no permitido. Permitidos: ${r2Config.allowedTypes.join(", ")}`
        )
      );
    } else {
      cb(null, true);
    }
  },
});

/**
 * Controlador para obtener URL firmada de subida (PUT) y clave
 * El cliente sube el archivo directamente a R2 usando esta URL.
 */
export const getUploadUrlHandler = async (req: Request, res: Response) => {
  try {
    const { fileName, contentType, expectedSize } = req.body || {};

    if (!fileName || !contentType) {
      return res.status(400).json({
        success: false,
        error: "Se requiere fileName y contentType",
      });
    }

    const result = await getUploadPresignedUrl(
      fileName,
      contentType,
      typeof expectedSize === "number" ? expectedSize : undefined
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error en getUploadUrlHandler:", error);
    return res.status(500).json({
      success: false,
      error: `Error al generar URL de subida: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }
};

/**
 * Controlador para buscar archivos en R2
 */
export const searchFilesHandler = async (req: Request, res: Response) => {
  try {
    const { searchTerm, exactMatch } = req.query || {};

    if (!searchTerm || typeof searchTerm !== "string") {
      return res.status(400).json({
        success: false,
        error: "Se requiere el parámetro 'searchTerm'",
      });
    }

    const isExactMatch = exactMatch === "true";
    const result = await searchFiles(searchTerm, isExactMatch);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error en searchFilesHandler:", error);
    return res.status(500).json({
      success: false,
      error: `Error al buscar archivos: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }
};
