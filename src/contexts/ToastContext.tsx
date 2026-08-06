import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const ICONS: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const COLORS: Record<ToastType, string> = {
  success: 'text-emerald-500',
  error: 'text-rose-500',
  info: 'text-blue-500',
  warning: 'text-amber-500',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = 'success') => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => remove(id), 4000);
    },
    [remove]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <div
              key={t.id}
              className="animate-slide-in-right pointer-events-auto flex items-start gap-3 rounded-xl border border-app bg-surface px-4 py-3 shadow-lg"
            >
              <Icon className={`h-5 w-5 shrink-0 ${COLORS[t.type]}`} />
              <p className="flex-1 text-sm text-app">{t.message}</p>
              <button
                onClick={() => remove(t.id)}
                className="text-muted hover:text-app transition-colors"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx.toast;
}
