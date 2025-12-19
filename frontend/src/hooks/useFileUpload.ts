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
  success: boolean;
  uploadUrl: string;
}

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
      // 1. Solicitar URL firmada al backend
      const getUrlRes = await axios.post<UploadResponse>('/upload-url', {
        fileName: file.name,
        contentType: file.type,
        expectedSize: file.size,
      });

      if (!getUrlRes.data?.success || !getUrlRes.data?.uploadUrl) {
        throw new Error('No se pudo obtener la URL de subida');
      }

      // 2. Subir el archivo directamente a R2 usando XMLHttpRequest para obtener progreso
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const startTime = Date.now();
        let lastTime = startTime;
        let lastLoaded = 0;

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const currentTime = Date.now();
            const timeElapsed = (currentTime - lastTime) / 1000; // segundos
            const bytesUploaded = e.loaded - lastLoaded;

            // Calcular velocidad instantánea
            const speed = timeElapsed > 0 ? bytesUploaded / timeElapsed : 0;

            // Calcular tiempo estimado restante
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
            // Usar el key devuelto por el backend
            const keyFile = getUrlRes.data.key;
            if (keyFile) {
              setDownloadLink(`${DOMAIN_URL}/download/${keyFile}`);
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
