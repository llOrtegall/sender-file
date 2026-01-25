import {
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import {
  UploadUrlResponse,
  DownloadUrlResponse,
  MultipartInitiateResponse,
  MultipartPartUrlResponse,
  MultipartCompleteResponse,
  MultipartAbortResponse,
} from "../types/index";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, r2Config } from "../config/r2";
import { generateShortId } from "../utils/generateShortId";
import { prisma } from "../lib/prisma";

const MIN_PART_SIZE_BYTES = 5 * 1024 * 1024; // R2/S3 exige >= 5MB por parte
const DEFAULT_PART_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * Genera una URL firmada (PUT) para subir directo a R2 sin pasar por el VPS
 */
export async function getUploadPresignedUrl(
  originalFileName: string,
  contentType: string,
  expectedSize?: number
): Promise<UploadUrlResponse> {
  try {
    if (typeof expectedSize === "number" && expectedSize > r2Config.maxFileSize) {
      return {
        success: false,
        error: `El archivo excede el tamaño máximo permitido: ${r2Config.maxFileSize / 1024 / 1024}MB`,
      };
    }

    // Generar la key real de R2 (como antes)
    const timestamp = Date.now();
    const key = `${timestamp}-${originalFileName}`;

    // Generar un ID corto para mostrar al usuario
    const shortId = generateShortId(8);
    
    // Almacenar en la base de datos pg
    await prisma.urlMapping.create({
      data: {
        shortId: shortId,
        longUrl: key,
      }
    })

    const command = new PutObjectCommand({
      Bucket: r2Config.bucketName,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(r2Client, command, { expiresIn: r2Config.urlExpirySeconds || 300 });

    return {
      success: true,
      uploadUrl: url,
      key,
      shortId, // ID corto para mostrar al usuario
      expiresIn: r2Config.urlExpirySeconds || 300,
    };
  } catch (error) {
    console.error("Error al generar URL de subida firmada:", error);
    return {
      success: false,
      error: `Error al generar URL de subida: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Genera una URL firmada (GET) para descargar un archivo de R2
 * Acepta tanto el ID corto como la key real de R2
 */
export async function getDownloadPresignedUrl(ShortId: string): Promise<DownloadUrlResponse> {
  try {
    const { longUrl } = await prisma.urlMapping.findFirstOrThrow({
      where: { shortId: ShortId },
      select: {
        longUrl: true,
      }
    })
    // Verificar existencia del archivo antes de devolver la URL
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: r2Config.bucketName,
        Key: longUrl,
      });

      const { LastModified, ContentLength } = await r2Client.send(headCommand);

      if (!ContentLength) {
        throw new Error("Archivo no encontrado");
      }
      
      // Generar URL firmada para descarga
      const command = new GetObjectCommand({
        Bucket: r2Config.bucketName,
        Key: longUrl,
      });

      const url = await getSignedUrl(r2Client, command, { expiresIn: r2Config.urlExpirySeconds || 300 });

      return {
        success: true,
        downloadUrl: url,
        key: longUrl,
        expiresIn: r2Config.urlExpirySeconds || 300,
        LastModified
      };

    } catch (err) {
      return {
        success: false,
        error: "Archivo no encontrado",
      };
    }
  } catch (error) {
    console.error("Error al generar URL de descarga firmada:", error);
    return {
      success: false,
      error: `Error al generar URL de descarga: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Inicia una subida multipart para archivos grandes (ej. >200MB)
 */
export async function initiateMultipartUpload(
  originalFileName: string,
  contentType: string,
  expectedSize?: number,
  partSizeBytes?: number
): Promise<MultipartInitiateResponse> {
  try {
    if (typeof expectedSize === "number" && expectedSize > r2Config.maxFileSize) {
      return {
        success: false,
        error: `El archivo excede el tamaño máximo permitido: ${r2Config.maxFileSize / 1024 / 1024}MB`,
      };
    }

    const timestamp = Date.now();
    const key = `${timestamp}-${originalFileName}`;
    const shortId = generateShortId(8);
    const resolvedPartSize = Math.max(MIN_PART_SIZE_BYTES, partSizeBytes ?? DEFAULT_PART_SIZE_BYTES);

    // Almacenar en la base de datos pg
    await prisma.urlMapping.create({
      data: {
        shortId: shortId,
        longUrl: key,
      }
    })

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
  contentLength?: number
): Promise<MultipartPartUrlResponse> {
  try {
    if (!uploadId) {
      throw new Error("UploadId es requerido");
    }

    if (!Number.isInteger(partNumber) || partNumber < 1 || partNumber > 10000) {
      throw new Error("partNumber debe estar entre 1 y 10000");
    }

    const { longUrl } = await prisma.urlMapping.findFirstOrThrow({
      where: { shortId: keyOrShortId },
      select: { longUrl: true },
    });

    const command = new UploadPartCommand({
      Bucket: r2Config.bucketName,
      Key: longUrl,
      UploadId: uploadId,
      PartNumber: partNumber,
      ContentLength: contentLength,
    });

    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: r2Config.urlExpirySeconds || 300 });

    return {
      success: true,
      uploadUrl,
      key: longUrl,
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
  parts: Array<{ etag: string; partNumber: number }>
): Promise<MultipartCompleteResponse> {
  try {
    if (!uploadId) {
      throw new Error("UploadId es requerido");
    }

    if (!parts || parts.length === 0) {
      throw new Error("Se requieren las partes para completar el upload");
    }

    const { longUrl } = await prisma.urlMapping.findFirstOrThrow({
      where: { shortId: keyOrShortId },
      select: { longUrl: true },
    });

    const sortedParts = parts
      .map((p) => ({ ETag: p.etag, PartNumber: p.partNumber }))
      .sort((a, b) => a.PartNumber - b.PartNumber);

    const command = new CompleteMultipartUploadCommand({
      Bucket: r2Config.bucketName,
      Key: longUrl,
      UploadId: uploadId,
      MultipartUpload: { Parts: sortedParts },
    });

    const result = await r2Client.send(command);

    return {
      success: true,
      key: result.Key || longUrl,
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
  uploadId: string
): Promise<MultipartAbortResponse> {
  try {
    if (!uploadId) {
      throw new Error("UploadId es requerido");
    }

    const { longUrl } = await prisma.urlMapping.findFirstOrThrow({
      where: { shortId: keyOrShortId },
      select: { longUrl: true },
    });

    const command = new AbortMultipartUploadCommand({
      Bucket: r2Config.bucketName,
      Key: longUrl,
      UploadId: uploadId,
    });

    await r2Client.send(command);

    return {
      success: true,
      key: longUrl,
    };
  } catch (error) {
    console.error("Error al abortar multipart:", error);
    return {
      success: false,
      error: `Error al abortar multipart: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}