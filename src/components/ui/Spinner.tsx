import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-primary-600', className)} />;
}

export function FullPageSpinner({ message }: { message?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-app">
      <Spinner className="h-8 w-8" />
      {message && <p className="text-sm text-muted">{message}</p>}
    </div>
  );
}
