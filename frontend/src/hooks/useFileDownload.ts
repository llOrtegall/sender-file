import { useState, useEffect } from 'react';
import axios from 'axios';

export type FileData = {
  key: string;
  size?: number;
  lastModified: string;
}

export type ResponseFileData = {
  success: boolean;
  files: FileData[];
}

type UseFileDownloadReturn = {
  fileData: FileData | null;
  isLoading: boolean;
  error: string | null
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
        const response = await axios.get<ResponseFileData>(`/search?searchTerm=${fileId}&exactMatch=false`);
        const data = response.data;

        if (!data.success || data.files.length === 0) {
          throw new Error('El archivo no existe o ya expiró.');
        }

        setFileData(data.files[0]);
      } catch {
        setError('El archivo no existe o ya expiró.');
        setFileData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFileInfo();
  }, [fileId]);


  return {
    fileData,
    isLoading,
    error
  };
};
