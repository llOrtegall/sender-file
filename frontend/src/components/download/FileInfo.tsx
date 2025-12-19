import { Link } from 'react-router-dom';
import type { FileData } from '../../hooks/useFileDownload';

type FileInfoProps = {
  fileData: FileData;
  isDownloading?: boolean;
  onDownload?: (downloadUrl: string, key: string) => Promise<void>;
};

export default function FileInfo({ fileData, isDownloading = false, onDownload }: FileInfoProps) {
  return (
    <section className="bg-green-5 min-w-156.5 flex flex-col items-center px-12 py-4 rounded-3xl space-y-4">
      <h2 className="font-imb-600 text-lg text-gray-200 text-center wrap-break-word">{
      fileData.key.split('-').slice(1).join('-') || 'Unknown File'
      }</h2>

      <article className="font-imb-400 text-sm text-gray-1 flex items-center gap-2">
        <span className="truncate max-w-64" title={fileData.key}>{fileData.key.split('-')[0] || 'Unknown Prefix'}</span>
        <span>•</span>
        <span>{fileData.LastModified.split('T')[0] || 'Unknown Date'}</span>
        <span>{fileData.LastModified.split('T')[1].split('.')[0] || 'Unknown Time'}</span>

      </article>

      <button
        onClick={() => onDownload && onDownload(fileData.downloadUrl, fileData.key)}
        disabled={isDownloading}
        className="min-w-45.75 bg-white text-lg text-green-2 font-imb-600 px-10 py-1 rounded-md hover:bg-green-4 hover:text-white transition-colors duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={`Download ${fileData.key}`}
      >
        {isDownloading ? 'Descargando...' : 'Download'}
      </button>

      <Link to="/" className="text-[#666666] text-[10px] font-imb-600 underline">
        Upload your own files here ⭢
      </Link>
    </section>
  );
}
