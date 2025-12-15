import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../main';

export type FileData = {
  id: string;
  originalName: string;
  filename: string;
  size: number;
  uploadDate: string;
};

type UseFileDownloadReturn = {
  fileData: FileData | null;
  isLoading: boolean;
  error: string | null;
  downloadFile: () => void;
};

export const useFileDownload = (fileId: string | undefined): UseFileDownloadReturn => {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
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
        const response = await axios.get<FileData>(`/file-info/${fileId}`);
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

  const downloadFile = useCallback(() => {
    if (!fileId || !fileData) return;
    const downloadEndpoint = `${API_BASE_URL}/download-content/${fileId}`;
    
    // Crear elemento de descarga temporal para evitar ventana emergente
    const link = document.createElement('a');
    link.href = downloadEndpoint;
    link.setAttribute('download', fileData.originalName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [fileId, fileData]);

  return {
    fileData,
    isLoading,
    error,
    downloadFile,
  };
};
