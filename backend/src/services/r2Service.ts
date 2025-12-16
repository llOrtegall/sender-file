import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { UploadUrlResponse } from "../types/index";
import { r2Client, r2Config } from "../config/r2";

type SearchFileResponse = {
  success: boolean;
  files?: Array<{
    key: string;
    size: number;
    lastModified: Date;
  }>;
  error?: string;
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
 * Busca archivos en R2 por nombre (búsqueda exacta o parcial)
 */
export async function searchFiles(
  searchTerm: string,
  exactMatch: boolean = false
): Promise<SearchFileResponse> {
  try {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return {
        success: false,
        error: "El término de búsqueda no puede estar vacío",
      };
    }

    const command = new ListObjectsV2Command({
      Bucket: r2Config.bucketName,
      MaxKeys: 1000,
    });

    const response = await r2Client.send(command);

    if (!response.Contents) {
      return {
        success: true,
        files: [],
      };
    }

    const searchTermLower = searchTerm.toLowerCase();
    const filteredFiles = response.Contents.filter((object) => {
      const keyLower = (object.Key || "").toLowerCase();
      return exactMatch ? keyLower === searchTermLower : keyLower.includes(searchTermLower);
    }).map((object) => ({
      key: object.Key || "",
      size: object.Size || 0,
      lastModified: object.LastModified || new Date(),
    }));

    return {
      success: true,
      files: filteredFiles,
    };
  } catch (error) {
    console.error("Error al buscar archivos en R2:", error);
    return {
      success: false,
      error: `Error al buscar archivos: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}