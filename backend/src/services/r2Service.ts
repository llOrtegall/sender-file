import {
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import {
  MultipartInitiateResponse,
  MultipartPartUrlResponse,
  MultipartCompleteResponse,
  MultipartAbortResponse,
} from "../types/index";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, r2Config } from "../config/r2";
import { generateShortId } from "../utils/generateShortId";

const MIN_PART_SIZE_BYTES = 5 * 1024 * 1024; // R2/S3 exige >= 5MB por parte
const DEFAULT_PART_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * Inicia una subida multipart para archivos grandes (ej. >200MB)
 */
export async function initiateMultipartUpload(
  originalFileName: string,
  contentType: string,
  expectedSize?: number,
  partSizeBytes?: number,
): Promise<MultipartInitiateResponse> {
  try {
    if (
      typeof expectedSize === "number" &&
      expectedSize > r2Config.maxFileSize
    ) {
      return {
        success: false,
        error: `El archivo excede el tamaño máximo permitido: ${r2Config.maxFileSize / 1024 / 1024}MB`,
      };
    }

    const timestamp = Date.now();
    const key = `${timestamp}-${originalFileName}`;
    const shortId = generateShortId(8);
    const resolvedPartSize = Math.max(
      MIN_PART_SIZE_BYTES,
      partSizeBytes ?? DEFAULT_PART_SIZE_BYTES,
    );

    // Almacenar en la base de datos pg
    await prisma.urlMapping.create({
      data: {
        shortId: shortId,
        longNameFile: key,
      },
    });

    const command = new CreateMultipartUploadCommand({
      Bucket: r2Config.bucketName,
      Key: key,
      ContentType: contentType,
    });

    const { UploadId } = await r2Client.send(command);

    if (!UploadId) {
      throw new Error("No se pudo obtener UploadId");
    }

    return {
      success: true,
      uploadId: UploadId,
      key,
      shortId,
      partSize: resolvedPartSize,
      expiresIn: r2Config.urlExpirySeconds || 300,
    };
  } catch (error) {
    console.error("Error al iniciar subida multipart:", error);
    return {
      success: false,
      error: `Error al iniciar multipart: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Genera URL firmada para subir una parte concreta
 */
export async function getMultipartPartPresignedUrl(
  keyOrShortId: string,
  uploadId: string,
  partNumber: number,
  contentLength?: number,
): Promise<MultipartPartUrlResponse> {
  try {
    if (!uploadId) {
      throw new Error("UploadId es requerido");
    }

    if (!Number.isInteger(partNumber) || partNumber < 1 || partNumber > 10000) {
      throw new Error("partNumber debe estar entre 1 y 10000");
    }

    const { longNameFile } = await prisma.urlMapping.findFirstOrThrow({
      where: { shortId: keyOrShortId },
      select: { longNameFile: true },
    });

    const command = new UploadPartCommand({
      Bucket: r2Config.bucketName,
      Key: longNameFile,
      UploadId: uploadId,
      PartNumber: partNumber,
      ContentLength: contentLength,
    });

    const uploadUrl = await getSignedUrl(r2Client, command, {
      expiresIn: r2Config.urlExpirySeconds || 300,
    });

    return {
      success: true,
      uploadUrl,
      key: longNameFile,
      partNumber,
      expiresIn: r2Config.urlExpirySeconds || 300,
    };
  } catch (error) {
    console.error("Error al generar URL de parte multipart:", error);
    return {
      success: false,
      error: `Error al generar URL de parte: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Completa la subida multipart con la lista de partes subidas
 */
export async function completeMultipartUpload(
  keyOrShortId: string,
  uploadId: string,
  parts: Array<{ etag: string; partNumber: number }>,
): Promise<MultipartCompleteResponse> {
  try {
    if (!uploadId) {
      throw new Error("UploadId es requerido");
    }

    if (!parts || parts.length === 0) {
      throw new Error("Se requieren las partes para completar el upload");
    }

    const { longNameFile } = await prisma.urlMapping.findFirstOrThrow({
      where: { shortId: keyOrShortId },
      select: { longNameFile: true },
    });

    const sortedParts = parts
      .map((p) => ({ ETag: p.etag, PartNumber: p.partNumber }))
      .sort((a, b) => a.PartNumber - b.PartNumber);

    const command = new CompleteMultipartUploadCommand({
      Bucket: r2Config.bucketName,
      Key: longNameFile,
      UploadId: uploadId,
      MultipartUpload: { Parts: sortedParts },
    });

    const result = await r2Client.send(command);

    return {
      success: true,
      key: result.Key || longNameFile,
    };
  } catch (error) {
    console.error("Error al completar multipart:", error);
    return {
      success: false,
      error: `Error al completar multipart: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Aborta una subida multipart en progreso
 */
export async function abortMultipartUpload(
  keyOrShortId: string,
  uploadId: string,
): Promise<MultipartAbortResponse> {
  try {
    if (!uploadId) {
      throw new Error("UploadId es requerido");
    }

    const { longNameFile } = await prisma.urlMapping.findFirstOrThrow({
      where: { shortId: keyOrShortId },
      select: { longNameFile: true },
    });

    const command = new AbortMultipartUploadCommand({
      Bucket: r2Config.bucketName,
      Key: longNameFile,
      UploadId: uploadId,
    });

    await r2Client.send(command);

    return {
      success: true,
      key: longNameFile,
    };
  } catch (error) {
    console.error("Error al abortar multipart:", error);
    return {
      success: false,
      error: `Error al abortar multipart: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
