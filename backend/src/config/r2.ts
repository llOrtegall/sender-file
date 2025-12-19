import { S3Client } from "@aws-sdk/client-s3";
import {
  MAX_FILE_SIZE, R2_ACCESS_KEY_ID, R2_OBJECTS_PUBLIC,
  R2_ACCOUNT_ID, R2_BUCKET_NAME, R2_ENDPOINT, R2_SECRET_ACCESS_KEY, URL_EXPIRY_SECONDS
} from './envSchema';


// Cliente S3 configurado para R2
export const r2Client = new S3Client({
  region: "auto",
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY
  },
  endpoint: R2_ENDPOINT,
});

export const r2Config = {
  bucketName: R2_BUCKET_NAME,
  accountId: R2_ACCOUNT_ID,
  endpoint: R2_ENDPOINT,
  maxFileSize: MAX_FILE_SIZE,
  urlExpirySeconds: parseInt(URL_EXPIRY_SECONDS || "300"),
  objectsArePublic: R2_OBJECTS_PUBLIC
};
