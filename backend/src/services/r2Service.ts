import { PutObjectCommand, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { UploadUrlResponse, DownloadUrlResponse } from "../types/index";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, r2Config } from "../config/r2";
import { generateShortId } from "../utils/generateShortId";

// Mapa en memoria para asociar IDs cortos con keys reales de R2
const shortIdMap = new Map<string, string>();

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
    
    // Guardar el mapeo shortId -> key real
    shortIdMap.set(shortId, key);

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
export async function getDownloadPresignedUrl(keyOrShortId: string): Promise<DownloadUrlResponse> {
  try {
    // Intentar obtener la key real desde el shortId
    let key = shortIdMap.get(keyOrShortId) || keyOrShortId;

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