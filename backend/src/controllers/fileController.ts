import { Request, Response } from "express";

import { getUploadPresignedUrl } from "../services/getUploadUrl";
import { getDownloadPresignedUrl } from "../services/GetDowloadUrl";

import { validateUpload } from "../schema/UploadValidator";
import { validateDownload } from "../schema/DowloadValidator";

import {
  initiateMultipartUpload,
  getMultipartPartPresignedUrl,
  completeMultipartUpload,
  abortMultipartUpload,
} from "../services/r2Service";

export const getUploadUrlHandler = async (req: Request, res: Response) => {
  try {
    const { fileName, contentType, expectedSize } = validateUpload(req.body);

    const result = await getUploadPresignedUrl(
      fileName,
      contentType,
      expectedSize,
    );

    if (!result.success) {
      res.status(400).json(result);
      return;
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

export const getDownloadUrlHandler = async (req: Request, res: Response) => {
  try {
    const { shortId } = validateDownload(req.params);

    const result = await getDownloadPresignedUrl(shortId);

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
 * Inicia una subida multipart (para archivos grandes)
 */
export const initiateMultipartUploadHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const { fileName, contentType, expectedSize, partSize } = req.body || {};

    if (!fileName || !contentType) {
      return res
        .status(400)
        .json({ success: false, error: "Se requiere fileName y contentType" });
    }

    const result = await initiateMultipartUpload(
      fileName,
      contentType,
      typeof expectedSize === "number" ? expectedSize : undefined,
      typeof partSize === "number" ? partSize : undefined,
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error en initiateMultipartUploadHandler:", error);
    return res.status(500).json({
      success: false,
      error: `Error al iniciar multipart: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }
};

/**
 * Obtiene URL firmada para subir una parte específica
 */
export const getMultipartPartUrlHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const { keyOrShortId, uploadId, partNumber, contentLength } =
      req.body || {};

    if (!keyOrShortId || !uploadId || typeof partNumber !== "number") {
      return res
        .status(400)
        .json({
          success: false,
          error: "Se requiere keyOrShortId, uploadId y partNumber",
        });
    }

    const result = await getMultipartPartPresignedUrl(
      keyOrShortId,
      uploadId,
      partNumber,
      typeof contentLength === "number" ? contentLength : undefined,
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error en getMultipartPartUrlHandler:", error);
    return res.status(500).json({
      success: false,
      error: `Error al generar URL de parte: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }
};

/**
 * Completa una subida multipart
 */
export const completeMultipartUploadHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const { keyOrShortId, uploadId, parts } = req.body || {};

    if (!keyOrShortId || !uploadId || !Array.isArray(parts)) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Se requiere keyOrShortId, uploadId y parts",
        });
    }

    const normalizedParts = parts
      .filter(
        (p: any) =>
          p && typeof p.partNumber === "number" && typeof p.etag === "string",
      )
      .map((p: any) => ({ partNumber: p.partNumber, etag: p.etag }));

    if (normalizedParts.length === 0) {
      return res
        .status(400)
        .json({
          success: false,
          error: "La lista de parts es inválida o vacía",
        });
    }

    const result = await completeMultipartUpload(
      keyOrShortId,
      uploadId,
      normalizedParts,
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error en completeMultipartUploadHandler:", error);
    return res.status(500).json({
      success: false,
      error: `Error al completar multipart: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }
};

/**
 * Aborta una subida multipart
 */
export const abortMultipartUploadHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const { keyOrShortId, uploadId } = req.body || {};

    if (!keyOrShortId || !uploadId) {
      return res
        .status(400)
        .json({ success: false, error: "Se requiere keyOrShortId y uploadId" });
    }

    const result = await abortMultipartUpload(keyOrShortId, uploadId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error en abortMultipartUploadHandler:", error);
    return res.status(500).json({
      success: false,
      error: `Error al abortar multipart: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }
};
