import { Loader2 } from 'lucide-react';

type LoadingStateProps = {
  message?: string;
};

export default function LoadingState({ message = 'Cargando...' }: LoadingStateProps) {
  return (
    <div className="flex items-center gap-3 text-gray-200">
      <Loader2 className="animate-spin" size={24} />
      <span className="font-imb-400">{message}</span>
    </div>
  );
}
