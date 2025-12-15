import { useDropzone } from 'react-dropzone';
import MyIcon from '../../assets/UploadIcon.svg';

type UploadZoneProps = {
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
};

const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1GB

export default function UploadZone({ onFileSelect, isUploading = false }: UploadZoneProps) {
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    onDrop,
    disabled: isUploading,
  });

  return (
    <article
      {...getRootProps()}
      className={`bg-green-3 rounded-full h-96 w-96 flex cursor-pointer items-center justify-center border border-dashed border-green-4 transition-colors ${
        isDragActive ? 'bg-green-900' : ''
      } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <section className="flex flex-col items-center space-y-1.75">
        <input {...getInputProps()} type="file" />
        <figure>
          <img src={MyIcon} width={55} alt="Upload icon" />
        </figure>
        <h2 className="font-imb-600 text-[16px] text-gray-1">
          {isUploading ? 'Uploading...' : 'Upload File'}
        </h2>
        <p className="font-imb-400 text-[12px] text-gray-1 font-normal">
          Drag and drop or click to upload
        </p>
        <p className="font-imb-400 text-[10px] text-gray-2">Max Upload: 1GB</p>
      </section>
    </article>
  );
}
