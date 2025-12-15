import {
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { r2Client, r2Config } from "../config/r2";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  UploadResponse,
  ListFilesResponse,
  FileInfo,
  DeleteResponse,
  DownloadResponse,
  UploadUrlResponse,
  DownloadUrlResponse,
} from "../types/index";

/**
 * Sube un archivo a R2
 */
export async function uploadFile(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<UploadResponse> {
  try {
    // Validar tipo MIME
    const fileExtension = fileName.split(".").pop()?.toLowerCase();
    if (!fileExtension || !r2Config.allowedTypes.includes(fileExtension)) {
      return {
        success: false,
        error: `Tipo de archivo no permitido. Permitidos: ${r2Config.allowedTypes.join(", ")}`,
      };
    }

    // Validar tamaño
    if (fileBuffer.length > r2Config.maxFileSize) {
      return {
        success: false,
        error: `El archivo excede el tamaño máximo permitido: ${r2Config.maxFileSize / 1024 / 1024}MB`,
      };
    }

    // Generar nombre único con timestamp
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${fileName}`;

    // Subir a R2
    const command = new PutObjectCommand({
      Bucket: r2Config.bucketName,
      Key: uniqueFileName,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await r2Client.send(command);

    // Construir URL del archivo usando la URL pública
    const fileUrl = `${r2Config.publicUrl}/${uniqueFileName}`;

    return {
      success: true,
      fileUrl,
      fileName: uniqueFileName,
      size: fileBuffer.length,
    };
  } catch (error) {
    console.error("Error al subir archivo a R2:", error);
    return {
      success: false,
      error: `Error al subir archivo: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Descarga un archivo de R2
 */
export async function downloadFile(fileName: string): Promise<DownloadResponse> {
  try {
    const command = new GetObjectCommand({
      Bucket: r2Config.bucketName,
      Key: fileName,
    });

    const response = await r2Client.send(command);
    const data = await response.Body?.transformToByteArray();

    if (!data) {
      return {
        success: false,
        error: "No se pudo leer el archivo",
      };
    }

    return {
      success: true,
      data: Buffer.from(data),
      contentType: response.ContentType || "application/octet-stream",
    };
  } catch (error) {
    console.error("Error al descargar archivo de R2:", error);
    return {
      success: false,
      error: `Error al descargar archivo: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

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
 * Genera una URL firmada (GET) para descargar directo de R2
 * Si el bucket/objeto es público, se puede devolver la publicUrl directamente.
 */
export async function getDownloadPresignedUrl(key: string): Promise<DownloadUrlResponse> {
  try {
    // Si usas objetos públicos, devolver la URL pública evita usar URL firmada.
    if (r2Config.objectsArePublic) {
      return {
        success: true,
        downloadUrl: `${r2Config.publicUrl}/${key}`,
        expiresIn: 0,
        key,
      };
    }

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
    };
  } catch (error) {
    console.error("Error al generar URL de descarga firmada:", error);
    return {
      success: false,
      error: `Error al generar URL de descarga: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Lista todos los archivos en el bucket
 */
export async function listFiles(): Promise<ListFilesResponse> {
  try {
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

    const files: FileInfo[] = response.Contents.map((object) => ({
      key: object.Key || "",
      size: object.Size || 0,
      lastModified: object.LastModified || new Date(),
      url: `${r2Config.publicUrl}/${object.Key}`,
    }));

    return {
      success: true,
      files,
    };
  } catch (error) {
    console.error("Error al listar archivos de R2:", error);
    return {
      success: false,
      error: `Error al listar archivos: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Elimina un archivo de R2
 */
export async function deleteFile(fileName: string): Promise<DeleteResponse> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: r2Config.bucketName,
      Key: fileName,
    });

    await r2Client.send(command);

    return {
      success: true,
      message: `Archivo ${fileName} eliminado exitosamente`,
    };
  } catch (error) {
    console.error("Error al eliminar archivo de R2:", error);
    return {
      success: false,
      error: `Error al eliminar archivo: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
