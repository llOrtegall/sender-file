import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export type FileData = {
  success: boolean;
  downloadUrl: string;
  key: string;
  expiresIn: number;
  size: number;
  lastModified: string;
  contentLength: number;
};

type UseFileDownloadReturn = {
  fileData: FileData | null;
  isLoading: boolean;
  isDownloading: boolean;
  downloadProgress: number;
  error: string | null;
  downloadFile: (downloadUrl: string, key: string) => Promise<void>;
};

export const useFileDownload = (fileId: string | undefined): UseFileDownloadReturn => {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fileId) {
      setError('ID de archivo inválido.');
      setIsLoading(false);
      return;
    }

    const fetchFileInfo = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get<FileData>(`/download-url/${fileId}`);

        if (!response.data.success) {
          throw new Error('El archivo no existe o ya expiró.');
        }

        setFileData(response.data);
      } catch {
        setError('El archivo no existe o ya expiró.');
        setFileData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFileInfo();
  }, [fileId]);

  const downloadFile = useCallback(async (downloadUrl: string, key: string) => {
    if (!downloadUrl || !key) return;
    setIsDownloading(true);
    setDownloadProgress(0);
    setError(null);

    try {
      // Descargar con fetch para rastrear el progreso
      const response = await fetch(downloadUrl);
      
      if (!response.ok) {
        throw new Error('Error al descargar el archivo.');
      }

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      
      if (!response.body) {
        throw new Error('No se pudo obtener el contenido del archivo.');
      }

      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let receivedLength = 0;

      // Leer el stream y actualizar progreso
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        receivedLength += value.length;
        
        // Actualizar progreso
        if (total > 0) {
          const progress = Math.round((receivedLength / total) * 100);
          setDownloadProgress(progress);
        }
      }

      // Crear blob y descargar
      const blob = new Blob(chunks as BlobPart[]);
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = key.replace(/^\d+-/, ''); // Nombre sin timestamp
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 100);

      setDownloadProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al descargar el archivo.');
      setDownloadProgress(0);
    } finally {
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
      }, 1000);
    }
  }, []);

  return {
    fileData,
    isLoading,
    isDownloading,
    downloadProgress,
    error,
    downloadFile,
  };
};
