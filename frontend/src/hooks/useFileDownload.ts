import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export type FileData = {
  success: boolean;
  downloadUrl: string;
  key: string;
  size: number;
  LastModified: string;
};

type UseFileDownloadReturn = {
  fileData: FileData | null;
  isLoading: boolean;
  isDownloading: boolean;
  error: string | null;
  downloadFile: (downloadUrl: string, key: string) => Promise<void>;
};

export const useFileDownload = (fileId: string | undefined): UseFileDownloadReturn => {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
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
    setError(null);

    try {
      // Dejar que el navegador maneje la descarga directamente
      // Esto hace que aparezca en el gestor de descargas de Chrome
      // y muestre el progreso para archivos grandes
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', key);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al descargar el archivo.');
    } finally {
      setIsDownloading(false);
    }
  }, []);

  return {
    fileData,
    isLoading,
    isDownloading,
    error,
    downloadFile,
  };
};
