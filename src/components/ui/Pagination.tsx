import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { cn, totalPages } from '@/lib/utils';

interface PaginationProps {
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, total, pageSize, onPageChange }: PaginationProps) {
  const pages = totalPages(total, pageSize);
  if (pages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-app px-4 py-3">
      <p className="text-sm text-muted">
        Page {page} of {pages}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="h-4 w-4" />
          Prev
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: pages }, (_, i) => i + 1)
            .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === pages)
            .map((p, idx, arr) => (
              <span key={p} className="flex items-center">
                {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-muted">…</span>}
                <button
                  onClick={() => onPageChange(p)}
                  className={cn(
                    'h-8 w-8 rounded-lg text-sm font-medium transition-colors',
                    p === page ? 'bg-primary-600 text-white' : 'text-app hover:bg-surface-2'
                  )}
                >
                  {p}
                </button>
              </span>
            ))}
        </div>
        <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
