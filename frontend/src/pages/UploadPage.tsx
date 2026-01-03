import UploadZone from '../components/upload/UploadZone';
import UploadSuccess from '../components/upload/UploadSuccess';
import ErrorMessage from '../components/ui/ErrorMessage';
import { useFileUpload } from '../hooks/useFileUpload';

export default function UploadPage() {
  const {
    uploadFile,
    downloadLink,
    isUploading,
    isCancelling,
    isMultipartUpload,
    error,
    progress,
    cancelUpload,
    resetUpload,
  } = useFileUpload();

  const handleFileSelect = (file: File) => {
    uploadFile(file);
  };

  const handleUploadAgain = () => {
    resetUpload();
  };

  return (
    <section className=''>
      {error && <ErrorMessage message={error} onDismiss={resetUpload} />}

      <section className="flex flex-col items-center gap-6">
        {!downloadLink
          ? (
            <UploadZone
              onFileSelect={handleFileSelect}
              isUploading={isUploading}
              isCancelling={isCancelling}
              isMultipartUpload={isMultipartUpload}
              onCancel={cancelUpload}
              progress={progress}
            />
          )
          : <UploadSuccess downloadLink={downloadLink} onUploadAgain={handleUploadAgain} />
        }
      </section>
    </section>
  );
}