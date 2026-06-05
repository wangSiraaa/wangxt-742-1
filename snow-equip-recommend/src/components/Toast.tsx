import { useAppStore } from '@/store/appStore';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toasts, removeToast } = useAppStore();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-72 animate-slide-in ${
            toast.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : toast.type === 'error'
              ? 'bg-red-50 border border-red-200 text-red-800'
              : 'bg-blue-50 border border-blue-200 text-blue-800'
          }`}
        >
          {toast.type === 'success' && (
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          )}
          {toast.type === 'error' && (
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          )}
          {toast.type === 'info' && (
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
          )}
          <span className="flex-1 text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 hover:bg-black/5 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
