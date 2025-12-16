import UploadZone from '../components/upload/UploadZone';
import UploadSuccess from '../components/upload/UploadSuccess';
import ErrorMessage from '../components/ui/ErrorMessage';
import { useFileUpload } from '../hooks/useFileUpload';

export default function UploadPage() {
  const { uploadFile, downloadLink, isUploading, error, progress, resetUpload } = useFileUpload();

  const handleFileSelect = (file: File) => {
    uploadFile(file);
  };

  const handleUploadAgain = () => {
    resetUpload();
  };

  return (
    <>
      {error && <ErrorMessage message={error} onDismiss={resetUpload} />}

      <section className="flex flex-col items-center gap-6">
        {!downloadLink
          ? <UploadZone onFileSelect={handleFileSelect} isUploading={isUploading} progress={progress} />
          : <UploadSuccess downloadLink={downloadLink} onUploadAgain={handleUploadAgain} />
        }
      </section>
    </>
  );
}