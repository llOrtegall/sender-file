import { useParams } from 'react-router-dom';
import { useFileDownload } from '../hooks/useFileDownload';
import FileInfo from '../components/download/FileInfo';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';

export default function DownloadPage() {
  const { id } = useParams<{ id: string }>();
  console.log(id);
  const { fileData, isLoading, isDownloading, error, downloadFile } = useFileDownload(id);

  if (isLoading) return <LoadingState message="Cargando información del archivo..." />

  if (error) return <ErrorState message={error} />;

  if (!fileData) return null;

  return <FileInfo fileData={fileData} isDownloading={isDownloading} onDownload={downloadFile} />
}