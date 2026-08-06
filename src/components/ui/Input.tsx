import { type InputHTMLAttributes, type TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-app">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-10 w-full rounded-lg border border-app bg-surface px-3 text-sm text-app placeholder:text-muted transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
            error && 'border-error-500 focus:border-error-500 focus:ring-error-500/20',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-error-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-app">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-lg border border-app bg-surface px-3 py-2 text-sm text-app placeholder:text-muted transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
            error && 'border-error-500',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-error-500">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, id, children, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-app">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            'h-10 w-full rounded-lg border border-app bg-surface px-3 text-sm text-app transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
            error && 'border-error-500',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-1 text-xs text-error-500">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
