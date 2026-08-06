import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children?: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm',
  secondary: 'bg-surface-2 text-app hover:bg-app border border-app',
  outline: 'border border-app bg-transparent text-app hover:bg-surface-2',
  ghost: 'bg-transparent text-app hover:bg-surface-2',
  danger: 'bg-error-500 text-white hover:bg-error-600 shadow-sm',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  icon: 'h-10 w-10',
};

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500/40 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
