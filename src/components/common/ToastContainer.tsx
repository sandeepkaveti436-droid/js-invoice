import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none no-print">
      {toasts.map(toast => {
        const Icon = toast.type === 'success' ? CheckCircle2 : toast.type === 'error' ? AlertCircle : Info;
        const colorClasses = 
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' :
          toast.type === 'error' ? 'bg-rose-50 text-rose-900 border-rose-200' :
          'bg-indigo-50 text-indigo-900 border-indigo-200';

        const iconColor =
          toast.type === 'success' ? 'text-emerald-500' :
          toast.type === 'error' ? 'text-rose-500' :
          'text-indigo-500';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-dropdown transition-all animate-in slide-in-from-bottom-5 duration-200 ${colorClasses}`}
          >
            <Icon className={`w-5 h-5 shrink-0 ${iconColor} mt-0.5`} />
            <div className="flex-1 text-xs font-medium leading-relaxed">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
