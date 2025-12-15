import { Link } from 'react-router-dom';
import type { FileData } from '../../hooks/useFileDownload';

type FileInfoProps = {
  fileData: FileData;
  onDownload: () => void;
};

const formatFileSize = (bytes: number): string => {
  return (bytes / 1024 / 1024).toFixed(2);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

export default function FileInfo({ fileData, onDownload }: FileInfoProps) {
  return (
    <section className="bg-green-5 min-w-156.5 flex flex-col items-center px-12 py-4 rounded-3xl space-y-4">
      <h2 className="font-imb-600 text-lg text-gray-200">{fileData.originalName}</h2>

      <article className="font-imb-400 text-sm text-gray-1 flex items-center gap-4">
        <span>{formatFileSize(fileData.size)} MB</span>
        <span>•</span>
        <span>{formatDate(fileData.uploadDate)}</span>
      </article>

      <button
        className="min-w-45.75 bg-white text-lg text-green-2 font-imb-600 px-10 py-1 rounded-md hover:bg-green-4 hover:text-white transition-colors duration-300 cursor-pointer"
        onClick={onDownload}
        aria-label={`Download ${fileData.originalName}`}
      >
        Download
      </button>

      <Link to="/" className="text-[#666666] text-[10px] font-imb-600 underline">
        Upload your own files here ⭢
      </Link>
    </section>
  );
}
