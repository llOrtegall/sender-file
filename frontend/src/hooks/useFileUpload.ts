import { useState, useCallback } from 'react';
import axios from 'axios';

type UseFileUploadReturn = {
  uploadFile: (file: File) => Promise<void>;
  downloadLink: string | null;
  isUploading: boolean;
  error: string | null;
  resetUpload: () => void;
};

export const useFileUpload = (): UseFileUploadReturn => {
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      // 1. Solicitar URL firmada al backend
      const getUrlRes = await axios.post('/upload-url', {
        fileName: file.name,
        contentType: file.type,
        expectedSize: file.size,
      });

      if (!getUrlRes.data?.success || !getUrlRes.data?.uploadUrl) {
        throw new Error(getUrlRes.data?.error || 'No se pudo obtener la URL de subida');
      }

      // 2. Subir el archivo directamente a R2 usando la URL firmada (PUT)
      const putRes = await axios.put(getUrlRes.data.uploadUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
        validateStatus: () => true, // para manejar manualmente el status
      });

      // 3. Guardar el enlace público solo si la subida fue exitosa
      if (putRes.status === 200 && getUrlRes.data.publicUrl) {
        setDownloadLink(getUrlRes.data.publicUrl);
      } else {
        setDownloadLink(null);
      }
    } catch (err) {
      setError('Error al subir el archivo. Por favor, intenta de nuevo.');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const resetUpload = useCallback(() => {
    setDownloadLink(null);
    setError(null);
  }, []);

  return {
    uploadFile,
    downloadLink,
    isUploading,
    error,
    resetUpload,
  };
};
