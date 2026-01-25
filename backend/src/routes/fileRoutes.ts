import {
  getUploadUrlHandler,
  getDownloadUrlHandler,
  initiateMultipartUploadHandler,
  getMultipartPartUrlHandler,
  completeMultipartUploadHandler,
  abortMultipartUploadHandler,
} from "../controllers/fileController";
import { Router } from "express";

export const fileRouter = Router();

fileRouter.post("/upload-url", getUploadUrlHandler);
fileRouter.get("/download-url/:shortId", getDownloadUrlHandler);

// Multipart upload (archivos grandes)
fileRouter.post("/upload-multipart/initiate", initiateMultipartUploadHandler);
fileRouter.post("/upload-multipart/part-url", getMultipartPartUrlHandler);
fileRouter.post("/upload-multipart/complete", completeMultipartUploadHandler);
fileRouter.post("/upload-multipart/abort", abortMultipartUploadHandler);
