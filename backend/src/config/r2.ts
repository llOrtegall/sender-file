import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

// Validar variables de entorno
const requiredEnvVars = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_ENDPOINT",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`⚠️  Variable de entorno faltante: ${envVar}`);
  }
}

// Cliente S3 configurado para R2
export const r2Client = new S3Client({
  region: "auto",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
  endpoint: process.env.R2_ENDPOINT || "",
});

export const r2Config = {
  bucketName: process.env.R2_BUCKET_NAME || "",
  accountId: process.env.R2_ACCOUNT_ID || "",
  endpoint: process.env.R2_ENDPOINT || "",
  publicUrl: process.env.R2_PUBLIC_URL || "",
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "104857600"), // 100MB por defecto
  allowedTypes: (process.env.ALLOWED_TYPES || "mp3,wav,docx,pdf,xlsx,sql").split(","),
  urlExpirySeconds: parseInt(process.env.URL_EXPIRY_SECONDS || "300"),
  objectsArePublic: (process.env.R2_OBJECTS_PUBLIC || "false").toLowerCase() === "true",
};
