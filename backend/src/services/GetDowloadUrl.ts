import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, r2Config } from "../config/r2";
import { prisma } from "../lib/prisma";

type FileMetadata = {
  key: string;
  lastModified?: Date;
  contentLength?: number;
};

type DownloadUrlSuccess = {
  success: true;
  downloadUrl: string;
  key: string;
  expiresIn: number;
  lastModified?: Date;
  contentLength?: number;
};

type DownloadUrlError = {
  success: false;
  error: string;
};

type DownloadUrlResult = DownloadUrlSuccess | DownloadUrlError;

const DEFAULT_URL_EXPIRY = 300;

const ERROR_MESSAGES = {
  INVALID_SHORT_ID: "El identificador corto no puede estar vacío",
  MAPPING_NOT_FOUND: "No se encontró el archivo asociado al identificador",
  FILE_NOT_FOUND: "El archivo no existe en el almacenamiento",
  FILE_VERIFICATION_FAILED: "Error al verificar la existencia del archivo",
  URL_GENERATION_FAILED: "No se pudo generar la URL de descarga",
} as const;

async function findFileKey(shortId: string): Promise<string> {
  try {
    const mapping = await prisma.urlMapping.findFirstOrThrow({
      where: { shortId },
      select: {
        longNameFile: true,
      },
    });
    return mapping.longNameFile;
  } catch (error) {
    console.error(`Error al buscar mapeo para shortId "${shortId}":`, error);
    throw new Error(ERROR_MESSAGES.MAPPING_NOT_FOUND);
  }
}

async function verifyFileExists(key: string): Promise<FileMetadata> {
  try {
    const headCommand = new HeadObjectCommand({
      Bucket: r2Config.bucketName,
      Key: key,
    });

    const metadata = await r2Client.send(headCommand);

    return {
      key,
      lastModified: metadata.LastModified,
      contentLength: metadata.ContentLength,
    };
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      error.name === "NotFound"
    ) {
      throw new Error(ERROR_MESSAGES.FILE_NOT_FOUND);
    }
    console.error(`Error al verificar archivo "${key}":`, error);
    throw new Error(ERROR_MESSAGES.FILE_VERIFICATION_FAILED);
  }
}

async function generateDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: r2Config.bucketName,
    Key: key,
  });

  const expiresIn = r2Config.urlExpirySeconds || DEFAULT_URL_EXPIRY;
  const url = await getSignedUrl(r2Client, command, { expiresIn });

  if (!url) {
    throw new Error(ERROR_MESSAGES.URL_GENERATION_FAILED);
  }

  return url;
}

export async function getDownloadPresignedUrl(
  shortId: string,
): Promise<DownloadUrlResult> {
  try {
    const fileKey = await findFileKey(shortId);

    const metadata = await verifyFileExists(fileKey);

    const downloadUrl = await generateDownloadUrl(fileKey);

    return {
      success: true,
      downloadUrl,
      key: metadata.key,
      expiresIn: r2Config.urlExpirySeconds || DEFAULT_URL_EXPIRY,
      lastModified: metadata.lastModified,
      contentLength: metadata.contentLength,
    };
  } catch (error) {
    console.error("Error al generar URL de descarga firmada:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}
