import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

type ErrorStateProps = {
  message: string;
  showHomeLink?: boolean;
};

export default function ErrorState({ message, showHomeLink = true }: ErrorStateProps) {
  return (
    <div className="bg-green-5 px-12 py-8 rounded-3xl flex flex-col items-center gap-4 max-w-md">
      <AlertCircle size={40} color="#ef4444" />
      <p className="text-red-400 text-center font-imb-400">{message}</p>
      {showHomeLink && (
        <Link
          to="/"
          className="text-gray-200 text-sm font-imb-400 underline hover:text-white transition-colors"
        >
          Ir al inicio
        </Link>
      )}
    </div>
  );
}
