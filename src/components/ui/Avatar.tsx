import { initials } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface AvatarProps {
  name: string;
  url?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-20 w-20 text-2xl',
};

export function Avatar({ name, url, size = 'md', className }: AvatarProps) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className={cn('rounded-full object-cover', SIZES[size], className)}
      />
    );
  }
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-primary-600 font-semibold text-white',
        SIZES[size],
        className
      )}
    >
      {initials(name) || '?'}
    </div>
  );
}
