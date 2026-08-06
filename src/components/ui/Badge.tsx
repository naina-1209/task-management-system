import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  dot?: string;
}

export function Badge({ children, className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        className
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />}
      {children}
    </span>
  );
}
