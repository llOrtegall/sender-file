import { useState, useCallback } from 'react';
import { Check, Copy, CheckCircle } from 'lucide-react';

type UploadSuccessProps = {
  downloadLink: string;
  onUploadAgain: () => void;
};

export default function UploadSuccess({ downloadLink, onUploadAgain }: UploadSuccessProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(downloadLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [downloadLink]);

  return (
    <article className="bg-green-3 rounded-full 
      h-64 w-64 lg:h-72 lg:w-72 2xl:h-96 2xl:w-96
      flex flex-col space-y-2 items-center justify-center border border-green-4 hover:bg-green-2 transition-colors">
      <figure>
        <CheckCircle size={48} color="#22c55e" />
      </figure>

      <h2 className="font-imb-600 text-gray-200">File Ready!</h2>
      <p className="text-gray-1 font-imb-400">Share this link to download</p>

      <div className="flex items-center w-10/12 gap-1 px-2 py-1 rounded-md text-[#AAAAAA] font-imb-400 bg-green-1">
        <input
          type="text"
          value={downloadLink}
          readOnly
          className="text-sm text-ellipsis flex-1 bg-transparent outline-none text-center"
          aria-label="Download link"
        />
        <button
          onClick={copyToClipboard}
          className="cursor-pointer hover:bg-gray-800 p-0.5 rounded-md transition-colors"
          aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </button>
      </div>

      <button
        onClick={onUploadAgain}
        className="font-imb-400 text-[#666666] hover:font-imb-400 cursor-pointer hover:underline transition-all"
      >
        Upload Again
      </button>
    </article>
  );
}
