import { useState, useCallback } from 'react';
import axios from 'axios';
import { DOMAIN_URL } from '../main';

export type UploadProgress = {
  percentage: number;
  uploadedBytes: number;
  totalBytes: number;
  speed: number; // bytes por segundo
  estimatedTimeRemaining: number; // segundos
};

type UseFileUploadReturn = {
  uploadFile: (file: File) => Promise<void>;
  downloadLink: string | null;
  isUploading: boolean;
  error: string | null;
  progress: UploadProgress | null;
  resetUpload: () => void;
};

type UploadResponse = {
  expiresIn: number;
  key: string;
  shortId?: string;
  success: boolean;
  uploadUrl: string;
};

type MultipartInitiateResponse = {
  success: boolean;
  uploadId?: string;
  key?: string;
  shortId?: string;
  partSize?: number;
  expiresIn?: number;
  error?: string;
};

type MultipartPartUrlResponse = {
  success: boolean;
  uploadUrl?: string;
  key?: string;
  partNumber?: number;
  expiresIn?: number;
  error?: string;
};

type MultipartCompleteResponse = {
  success: boolean;
  key?: string;
  error?: string;
};

const MULTIPART_THRESHOLD_BYTES = 200 * 1024 * 1024; // 200MB
const MAX_CONCURRENCY = 4;

export const useFileUpload = (): UseFileUploadReturn => {
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<UploadProgress | null>(null);

  const uploadFile = useCallback(async (file: File) => {
    setIsUploading(true);
    setError(null);
    setProgress(null);

    try {
      const shouldUseMultipart = file.size >= MULTIPART_THRESHOLD_BYTES;

      if (!shouldUseMultipart) {
        // Subida simple con XHR para progreso detallado
        const getUrlRes = await axios.post<UploadResponse>('/upload-url', {
          fileName: file.name,
          contentType: file.type,
          expectedSize: file.size,
        });

        if (!getUrlRes.data?.success || !getUrlRes.data?.uploadUrl) {
          throw new Error('No se pudo obtener la URL de subida');
        }

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          const startTime = Date.now();
          let lastTime = startTime;
          let lastLoaded = 0;

          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const currentTime = Date.now();
              const timeElapsed = (currentTime - lastTime) / 1000;
              const bytesUploaded = e.loaded - lastLoaded;

              const speed = timeElapsed > 0 ? bytesUploaded / timeElapsed : 0;
              const bytesRemaining = e.total - e.loaded;
              const estimatedTimeRemaining = speed > 0 ? bytesRemaining / speed : 0;

              setProgress({
                percentage: Math.round((e.loaded / e.total) * 100),
                uploadedBytes: e.loaded,
                totalBytes: e.total,
                speed,
                estimatedTimeRemaining,
              });

              lastTime = currentTime;
              lastLoaded = e.loaded;
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
              const displayId = getUrlRes.data.shortId || getUrlRes.data.key;
              if (displayId) {
                setDownloadLink(`${DOMAIN_URL}/${displayId}`);
              }
              resolve();
            } else {
              reject(new Error(`Error en la subida: ${xhr.status}`));
            }
          });

          xhr.addEventListener('error', () => {
            reject(new Error('Error de red al subir el archivo'));
          });

          xhr.addEventListener('abort', () => {
            reject(new Error('Subida cancelada'));
          });

          xhr.open('PUT', getUrlRes.data.uploadUrl);
          xhr.setRequestHeader('Content-Type', file.type);
          xhr.send(file);
        });
        return;
      }

      // Subida multipart para archivos grandes
      const initiateRes = await axios.post<MultipartInitiateResponse>('/upload-multipart/initiate', {
        fileName: file.name,
        contentType: file.type,
        expectedSize: file.size,
      });

      if (!initiateRes.data?.success || !initiateRes.data.uploadId || !initiateRes.data.key) {
        throw new Error(initiateRes.data?.error || 'No se pudo iniciar la subida multipart');
      }

      const uploadId = initiateRes.data.uploadId;
      const resolvedKey = initiateRes.data.shortId || initiateRes.data.key;
      const partSize = initiateRes.data.partSize || 10 * 1024 * 1024;

      const totalParts = Math.ceil(file.size / partSize);
      const parts = Array.from({ length: totalParts }, (_, idx) => {
        const start = idx * partSize;
        const end = Math.min(start + partSize, file.size);
        return { partNumber: idx + 1, blob: file.slice(start, end) };
      });

      const startTime = Date.now();
      let uploadedBytes = 0;
      const completedParts: { etag: string; partNumber: number }[] = [];

      const uploadPart = async (part: { partNumber: number; blob: Blob }) => {
        const partUrlRes = await axios.post<MultipartPartUrlResponse>('/upload-multipart/part-url', {
          keyOrShortId: resolvedKey,
          uploadId,
          partNumber: part.partNumber,
          contentLength: part.blob.size,
        });

        if (!partUrlRes.data?.success || !partUrlRes.data.uploadUrl) {
          throw new Error(partUrlRes.data?.error || `No se pudo obtener URL para la parte ${part.partNumber}`);
        }

        const putRes = await axios.put(partUrlRes.data.uploadUrl, part.blob, {
          headers: {
            'Content-Type': file.type || 'application/octet-stream',
          },
          withCredentials: false, // Presigned URL de R2 no acepta credenciales
          // onUploadProgress per parte sería granular pero poco confiable en presigned URL; usamos progreso por parte completada
        });

        const etag = (putRes.headers?.etag as string | undefined)?.replace(/"/g, '');
        if (!etag) {
          throw new Error(`No se recibió ETag para la parte ${part.partNumber}`);
        }

        uploadedBytes += part.blob.size;
        const elapsedSec = (Date.now() - startTime) / 1000;
        const speed = elapsedSec > 0 ? uploadedBytes / elapsedSec : 0;
        const bytesRemaining = file.size - uploadedBytes;
        const estimatedTimeRemaining = speed > 0 ? bytesRemaining / speed : 0;

        setProgress({
          percentage: Math.min(100, Math.round((uploadedBytes / file.size) * 100)),
          uploadedBytes,
          totalBytes: file.size,
          speed,
          estimatedTimeRemaining,
        });

        completedParts.push({ etag, partNumber: part.partNumber });
      };

      const queue = [...parts];
      const workers = Array.from({ length: Math.min(MAX_CONCURRENCY, queue.length) }, async () => {
        while (queue.length) {
          const next = queue.shift();
          if (next) {
            await uploadPart(next);
          }
        }
      });

      try {
        await Promise.all(workers);
      } catch (err) {
        // Ante fallo, abortar multipart
        try {
          await axios.post('/upload-multipart/abort', { keyOrShortId: resolvedKey, uploadId });
        } catch (abortErr) {
          console.error('Abort multipart failed:', abortErr);
        }
        throw err;
      }

      const completeRes = await axios.post<MultipartCompleteResponse>('/upload-multipart/complete', {
        keyOrShortId: resolvedKey,
        uploadId,
        parts: completedParts,
      });

      if (!completeRes.data?.success) {
        throw new Error(completeRes.data?.error || 'No se pudo completar la subida multipart');
      }

      setProgress({
        percentage: 100,
        uploadedBytes: file.size,
        totalBytes: file.size,
        speed: (file.size / ((Date.now() - startTime) / 1000)) || 0,
        estimatedTimeRemaining: 0,
      });

      if (resolvedKey) {
        setDownloadLink(`${DOMAIN_URL}/${resolvedKey}`);
      }

    } catch (err) {
      setError('Error al subir el archivo. Por favor, intenta de nuevo.');
      console.error('Upload error:', err);
      setDownloadLink(null);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const resetUpload = useCallback(() => {
    setDownloadLink(null);
    setError(null);
    setProgress(null);
  }, []);

  return {
    uploadFile,
    downloadLink,
    isUploading,
    error,
    progress,
    resetUpload,
  };
};
