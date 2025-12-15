import { Request, Response } from "express";
import multer, { Multer } from "multer";
import { r2Config } from "../config/r2";
import {
  uploadFile,
  downloadFile,
  listFiles,
  deleteFile,
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
 * Controlador para subir archivos
 */
export const uploadFileHandler = [
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No se proporcionó ningún archivo",
        });
      }

      const fileName =
        req.body.fileName ||
        req.file.originalname ||
        `file-${Date.now()}`;
      const result = await uploadFile(
        req.file.buffer,
        fileName,
        req.file.mimetype
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json({
        success: true,
        message: "Archivo subido exitosamente",
        fileUrl: result.fileUrl,
        fileName: result.fileName,
        size: result.size,
      });
    } catch (error) {
      console.error("Error en uploadFileHandler:", error);
      return res.status(500).json({
        success: false,
        error: `Error al procesar el archivo: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  },
];

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
 * Controlador para descargar archivos
 */
export const downloadFileHandler = async (req: Request, res: Response) => {
  try {
    const { fileName } = req.params;

    if (!fileName) {
      return res.status(400).json({
        success: false,
        error: "Se requiere el nombre del archivo",
      });
    }

    const result = await downloadFile(fileName);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.setHeader("Content-Type", result.contentType || "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );

    return res.send(result.data);
  } catch (error) {
    console.error("Error en downloadFileHandler:", error);
    return res.status(500).json({
      success: false,
      error: `Error al descargar archivo: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }
};

/**
 * Controlador para obtener URL de descarga directa (GET)
 */
export const getDownloadUrlHandler = async (req: Request, res: Response) => {
  try {
    const { fileName } = req.params;

    if (!fileName) {
      return res.status(400).json({
        success: false,
        error: "Se requiere el nombre del archivo",
      });
    }

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

/**
 * Controlador para listar archivos
 */
export const listFilesHandler = async (req: Request, res: Response) => {
  try {
    const result = await listFiles();

    if (!result.success) {
      return res.status(500).json(result);
    }

    return res.status(200).json({
      success: true,
      count: result.files?.length || 0,
      files: result.files,
    });
  } catch (error) {
    console.error("Error en listFilesHandler:", error);
    return res.status(500).json({
      success: false,
      error: `Error al listar archivos: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }
};

/**
 * Controlador para eliminar archivos
 */
export const deleteFileHandler = async (req: Request, res: Response) => {
  try {
    const { fileName } = req.params;

    if (!fileName) {
      return res.status(400).json({
        success: false,
        error: "Se requiere el nombre del archivo",
      });
    }

    const result = await deleteFile(fileName);

    if (!result.success) {
      return res.status(500).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error en deleteFileHandler:", error);
    return res.status(500).json({
      success: false,
      error: `Error al eliminar archivo: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }
};
