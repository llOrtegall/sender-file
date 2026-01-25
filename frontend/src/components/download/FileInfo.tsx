import { Link } from 'react-router-dom';
import type { FileData } from '../../hooks/useFileDownload';

type FileInfoProps = {
  fileData: FileData;
  isDownloading?: boolean;
  downloadProgress?: number;
  onDownload?: (downloadUrl: string, key: string) => Promise<void>;
};

function extractFileName(key: string): string {
  const UUID_LENGTH = 36;
  
  if (key.length > UUID_LENGTH + 1) {
    return key.substring(UUID_LENGTH + 1); 
  }
  
  return key;
}

export default function FileInfo({ fileData, isDownloading = false, downloadProgress = 0, onDownload }: FileInfoProps) {
  const fileName = extractFileName(fileData.key);
  
  return (
    <section className="bg-green-5 min-w-156.5 flex flex-col items-center px-12 py-4 rounded-3xl space-y-4">
      <h2 className="font-imb-600 text-lg text-gray-200 text-center wrap-break-word">
        {fileName || 'Unknown File'}
      </h2>

      <article className="font-imb-400 text-sm text-gray-1 flex items-center gap-2">
        <span className="truncate max-w-64" title={fileData.key}>{fileName}</span>
        <span>•</span>
        <span>{fileData.lastModified.split('T')[0] || 'Unknown Date'}</span>
        <span>{fileData.lastModified.split('T')[1].split('.')[0] || 'Unknown Time'}</span>

      </article>

      {isDownloading && downloadProgress > 0 && (
        <div className="w-full max-w-64">
          <div className="flex justify-between text-xs text-gray-1 mb-1">
            <span>Descargando...</span>
            <span>{downloadProgress}%</span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-300 ease-out"
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
        </div>
      )}

      <button
        onClick={() => onDownload && onDownload(fileData.downloadUrl, fileData.key)}
        disabled={isDownloading}
        className="min-w-45.75 bg-white text-lg text-green-2 font-imb-600 px-10 py-1 rounded-md hover:bg-green-4 hover:text-white transition-colors duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={`Download ${fileData.key}`}
      >
        {isDownloading ? (downloadProgress > 0 ? `${downloadProgress}%` : 'Descargando...') : 'Download'}
      </button>

      <Link to="/" className="text-[#666666] text-[10px] font-imb-600 underline">
        Upload your own files here ⭢
      </Link>
    </section>
  );
}
