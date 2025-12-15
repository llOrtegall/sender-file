import UploadZone from '../components/upload/UploadZone';
import UploadSuccess from '../components/upload/UploadSuccess';
import ErrorMessage from '../components/ui/ErrorMessage';
import { useFileUpload } from '../hooks/useFileUpload';

export default function UploadPage() {
  const { uploadFile, downloadLink, isUploading, error, resetUpload } = useFileUpload();

  const handleFileSelect = (file: File) => {
    uploadFile(file);
  };

  const handleUploadAgain = () => {
    resetUpload();
  };

  return (
    <>
      {error && <ErrorMessage message={error} onDismiss={resetUpload} />}
      
      <section>
        {!downloadLink ? (
          <UploadZone onFileSelect={handleFileSelect} isUploading={isUploading} />
        ) : (
          <UploadSuccess downloadLink={downloadLink} onUploadAgain={handleUploadAgain} />
        )}
      </section>
    </>
  );
}