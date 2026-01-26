import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { generateShortId } from "../utils/generateShortId";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, r2Config } from "../config/r2";
import { randomUUID } from "node:crypto";
import { saveMapping } from "./persistence";

type UploadUrlSuccess = {
  success: true;
  uploadUrl: string;
  key: string;
  shortId: string;
  expiresIn: number;
};

type UploadUrlError = {
  success: false;
  error: string;
};

type UploadUrlResult = UploadUrlSuccess | UploadUrlError;

const DEFAULT_URL_EXPIRY = 300;
const SHORT_ID_LENGTH = 8;

const ERROR_MESSAGES = {
  FILE_TOO_LARGE: (maxSize: number) =>
    `El archivo excede el tamaño máximo permitido: ${maxSize / 1024 / 1024}MB`,
  INVALID_FILENAME: "El nombre del archivo no puede estar vacío",
  INVALID_CONTENT_TYPE: "El tipo de contenido no puede estar vacío",
  INVALID_SIZE: "El tamaño del archivo debe ser mayor a 0",
  URL_GENERATION_FAILED: "No se pudo generar la URL de subida",
  DATABASE_ERROR: "Error al guardar el registro en la base de datos",
} as const;

function generateFileKey(originalFileName: string): string {
  const uuid = randomUUID();
  return `${uuid}-${originalFileName}`;
}

async function generatePresignedUrl(
  key: string,
  contentType: string,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: r2Config.bucketName,
    Key: key,
    ContentType: contentType,
  });

  const expiresIn = r2Config.urlExpirySeconds || DEFAULT_URL_EXPIRY;
  const url = await getSignedUrl(r2Client, command, { expiresIn });

  if (!url) {
    throw new Error(ERROR_MESSAGES.URL_GENERATION_FAILED);
  }

  return url;
}

async function saveUrlMapping(key: string): Promise<string> {
  const shortId = generateShortId(SHORT_ID_LENGTH);

  try {
    await saveMapping(shortId, key);
    return shortId;
  } catch (error) {
    console.error("Error al crear el mapeo en la base de datos:", error);
    throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
  }
}

export async function getUploadPresignedUrl(
  originalFileName: string,
  contentType: string,
  expectedSize: number,
): Promise<UploadUrlResult> {
  if (expectedSize > r2Config.maxFileSize) {
    throw new Error(ERROR_MESSAGES.FILE_TOO_LARGE(r2Config.maxFileSize));
  }

  try {
    const key = generateFileKey(originalFileName);

    const uploadUrl = await generatePresignedUrl(key, contentType);

    const shortId = await saveUrlMapping(key);

    return {
      success: true,
      uploadUrl,
      key,
      shortId,
      expiresIn: r2Config.urlExpirySeconds || DEFAULT_URL_EXPIRY,
    };
  } catch (error) {
    console.error("Error al generar URL de subida firmada:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}
