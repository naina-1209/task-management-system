import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({ open, onClose, title, children, className, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        className={cn(
          'relative w-full rounded-2xl border border-app bg-surface shadow-2xl animate-scale-in',
          SIZES[size],
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-app px-5 py-4">
            <h2 className="text-lg font-semibold text-app">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-app"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="max-h-[calc(100vh-10rem)] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
