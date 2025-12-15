import { AlertCircle } from 'lucide-react';

type ErrorMessageProps = {
  message: string;
  onDismiss?: () => void;
};

export default function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  return (
    <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 flex items-center gap-3 max-w-md">
      <AlertCircle size={24} color="#ef4444" />
      <p className="text-red-500 text-sm flex-1">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-500 hover:text-red-400 text-sm underline"
        >
          Cerrar
        </button>
      )}
    </div>
  );
}
