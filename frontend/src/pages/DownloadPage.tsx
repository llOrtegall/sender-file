import { useParams } from 'react-router-dom';
import { useFileDownload } from '../hooks/useFileDownload';
import FileInfo from '../components/download/FileInfo';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';

export default function DownloadPage() {
  const { id } = useParams<{ id: string }>();
  const { fileData, isLoading, error, downloadFile } = useFileDownload(id);

  if (isLoading) return <LoadingState message="Cargando información del archivo..." />

  if (error) return <ErrorState message={error} />;

  if (!fileData) return null;

  return <FileInfo fileData={fileData} onDownload={downloadFile} />
}