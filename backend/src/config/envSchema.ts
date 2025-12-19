import { z } from 'zod';

const envSchema = z.object({
  R2_ACCOUNT_ID: z.string().min(1, "R2_ACCOUNT_ID is required"),
  R2_ACCESS_KEY_ID: z.string().min(1, "R2_ACCESS_KEY_ID is required"),
  R2_SECRET_ACCESS_KEY: z.string().
    min(8, "R2_SECRET_ACCESS_KEY is required"),
  R2_BUCKET_NAME: z.string().min(1, "R2_BUCKET_NAME is required"),
  R2_ENDPOINT: z.string().min(1, "R2_ENDPOINT is required"),
  URL_EXPIRY_SECONDS: z.string().optional(),
  MAX_FILE_SIZE: z.string().transform((val) => parseInt(val)),
  R2_OBJECTS_PUBLIC: z.string().optional(),
  NODE_ENV: z.enum(["development", "production"]).optional().default("development"),
  PORT: z.string().transform((val) => parseInt(val)),
  CORS_ORIGIN: z.string(),
})

const { success, data, error } = envSchema.safeParse(process.env);

if (!success) {
  console.error("❌ Invalid environment variables:", error.format());
  process.exit(1);
}

export const {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_OBJECTS_PUBLIC,
  URL_EXPIRY_SECONDS,
  R2_BUCKET_NAME,
  R2_ENDPOINT,
  MAX_FILE_SIZE,
  CORS_ORIGIN,
  PORT,
  NODE_ENV,
 } = data;