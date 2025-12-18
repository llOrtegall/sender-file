import { Request, Response } from "express";
import multer, { Multer } from "multer";
import { r2Config } from "../config/r2";
import {
  getUploadPresignedUrl,
  getDownloadPresignedUrl,
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
 * Controlador para obtener URL de descarga de un archivo
 */
export const getDownloadUrlHandler = async (req: Request, res: Response) => {
  try {
    let { fileName } = req.params;

    if (!fileName) {
      return res.status(400).json({
        success: false,
        error: "Se requiere el nombre del archivo",
      });
    }

    // Decodificar el nombre del archivo en caso de caracteres especiales
    fileName = decodeURIComponent(fileName);

    const result = await getDownloadPresignedUrl(fileName);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error en getDownloadUrlHandler:", error);
    return res.status(500).json({
      success: false,
      error: `Error al generar URL de descarga: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }
};
