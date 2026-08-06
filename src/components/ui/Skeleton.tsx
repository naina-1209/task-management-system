import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-surface-2', className)} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-app bg-surface p-5 shadow-sm">
      <Skeleton className="mb-3 h-4 w-1/3" />
      <Skeleton className="mb-2 h-8 w-2/3" />
      <Skeleton className="h-3 w-1/4" />
    </div>
  );
}

export function TaskRowSkeleton() {
  return (
    <div className="flex items-center gap-4 border-b border-app p-4">
      <Skeleton className="h-5 w-5 rounded" />
      <div className="flex-1">
        <Skeleton className="mb-2 h-4 w-1/3" />
        <Skeleton className="h-3 w-1/5" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  );
}
