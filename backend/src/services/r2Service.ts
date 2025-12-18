import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { UploadUrlResponse } from "../types/index";
import { r2Client, r2Config } from "../config/r2";

type DownloadUrlResponse = {
  success: boolean;
  downloadUrl?: string;
  key?: string;
  expiresIn?: number;
  error?: string;
  LastModified?: Date | undefined;
};

/**
 * Genera una URL firmada (PUT) para subir directo a R2 sin pasar por el VPS
 */
export async function getUploadPresignedUrl(
  originalFileName: string,
  contentType: string,
  expectedSize?: number
): Promise<UploadUrlResponse> {
  try {
    const ext = originalFileName.split(".").pop()?.toLowerCase();
    if (!ext || !r2Config.allowedTypes.includes(ext)) {
      return {
        success: false,
        error: `Tipo de archivo no permitido. Permitidos: ${r2Config.allowedTypes.join(", ")}`,
      };
    }

    if (typeof expectedSize === "number" && expectedSize > r2Config.maxFileSize) {
      return {
        success: false,
        error: `El archivo excede el tamaño máximo permitido: ${r2Config.maxFileSize / 1024 / 1024}MB`,
      };
    }

    const timestamp = Date.now();
    const key = `${timestamp}-${originalFileName}`;

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
      publicUrl: `${r2Config.publicUrl}/${key}`,
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
 * Valida que el archivo exista antes de generar la URL
 */
export async function getDownloadPresignedUrl(key: string): Promise<DownloadUrlResponse> {
  try {
    // Verificar existencia del archivo antes de devolver la URL
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: r2Config.bucketName,
        Key: key,
      });

      const { LastModified, ContentLength } = await r2Client.send(headCommand);

      if (!ContentLength) {
        throw new Error("Archivo no encontrado");
      }
      // Generar URL firmada para descarga
      const command = new GetObjectCommand({
        Bucket: r2Config.bucketName,
        Key: key,
      });

      const url = await getSignedUrl(r2Client, command, { expiresIn: r2Config.urlExpirySeconds || 300 });

      return {
        success: true,
        downloadUrl: url,
        key,
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