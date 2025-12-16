import { Link } from 'react-router-dom';
import type { FileData } from '../../hooks/useFileDownload';

type FileInfoProps = {
  fileData: FileData
};

export default function FileInfo({ fileData }: FileInfoProps) {
  return (
    <section className="bg-green-5 min-w-156.5 flex flex-col items-center px-12 py-4 rounded-3xl space-y-4">
      <h2 className="font-imb-600 text-lg text-gray-200 text-center wrap-break-word">{fileData.key.split('-').slice(1).join('-')}</h2>

      <article className="font-imb-400 text-sm text-gray-1 flex items-center gap-2">
        <span className="truncate max-w-64" title={fileData.key}>{fileData.key}</span>
        <span>•</span>
        <span>{fileData.lastModified.slice(0, 10)}</span>
      </article>

      <button
        className="min-w-45.75 bg-white text-lg text-green-2 font-imb-600 px-10 py-1 rounded-md hover:bg-green-4 hover:text-white transition-colors duration-300 cursor-pointer"
        aria-label={`Download ${fileData.size}`}
      >
        Download
      </button>

      <Link to="/" className="text-[#666666] text-[10px] font-imb-600 underline">
        Upload your own files here ⭢
      </Link>
    </section>
  );
}
