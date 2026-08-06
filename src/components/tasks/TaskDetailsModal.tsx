import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Pencil,
  Copy,
  Pin,
  Star,
  Archive,
  Trash2,
  Clock,
  Calendar as CalIcon,
  Tag,
  Timer,
  StickyNote,
  CheckCircle2,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useTasks } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/contexts/ToastContext';
import { PRIORITY_META, STATUS_META, STATUSES } from '@/lib/constants';
import { cn, isOverdue, formatDate, formatDateTime } from '@/lib/utils';
import type { Task, Status } from '@/types';

interface TaskDetailsModalProps {
  task: Task;
  onClose: () => void;
}

export function TaskDetailsModal({ task, onClose }: TaskDetailsModalProps) {
  const { setStatus, togglePin, toggleFavorite, archiveTask, duplicateTask, softDelete } = useTasks();
  const { categories } = useCategories();
  const toast = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const pm = PRIORITY_META[task.priority];
  const sm = STATUS_META[task.status];
  const categoryName = task.category_id ? categories.find((c) => c.id === task.category_id)?.name : undefined;
  const overdue = isOverdue(task.due_date, task.status);

  return (
    <Modal open onClose={onClose} title="Task Details" size="lg">
      <div className="p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <h2 className={cn('text-xl font-bold', task.status === 'Completed' ? 'text-muted line-through' : 'text-app')}>
            {task.title}
          </h2>
          <div className="flex gap-1">
            <button onClick={() => togglePin(task.id)} className={cn('rounded-lg p-2 transition-colors', task.pinned ? 'text-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'text-muted hover:bg-surface-2 hover:text-app')} title="Pin">
              <Pin className={cn('h-4 w-4', task.pinned && 'fill-current')} />
            </button>
            <button onClick={() => toggleFavorite(task.id)} className={cn('rounded-lg p-2 transition-colors', task.favorite ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'text-muted hover:bg-surface-2 hover:text-app')} title="Favorite">
              <Star className={cn('h-4 w-4', task.favorite && 'fill-current')} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge className={cn(sm.bg, sm.color)}>{sm.label}</Badge>
          <Badge className="bg-surface-2 text-app"><span className={cn('h-1.5 w-1.5 rounded-full', pm.dot)} />{pm.label} Priority</Badge>
          {overdue && <Badge className="bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400">Overdue</Badge>}
          {categoryName && <Badge className="bg-surface-2 text-muted">{categoryName}</Badge>}
        </div>

        {task.description && (
          <div>
            <h3 className="mb-1.5 text-sm font-semibold text-app">Description</h3>
            <p className="text-sm text-muted whitespace-pre-wrap">{task.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {task.due_date && (
            <InfoRow icon={CalIcon} label="Due Date" value={formatDate(task.due_date)} highlight={overdue} />
          )}
          {task.estimated_time != null && (
            <InfoRow icon={Timer} label="Estimated Time" value={`${task.estimated_time} min`} />
          )}
          <InfoRow icon={Clock} label="Created" value={formatDateTime(task.created_at)} />
          <InfoRow icon={Clock} label="Updated" value={formatDateTime(task.updated_at)} />
        </div>

        {(task.tags ?? []).length > 0 && (
          <div>
            <h3 className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-app"><Tag className="h-4 w-4" />Tags</h3>
            <div className="flex flex-wrap gap-2">
              {(task.tags ?? []).map((tag) => (
                <Badge key={tag} className="bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">{tag}</Badge>
              ))}
            </div>
          </div>
        )}

        {task.notes && (
          <div>
            <h3 className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-app"><StickyNote className="h-4 w-4" />Notes</h3>
            <p className="rounded-lg bg-surface-2 p-3 text-sm text-muted whitespace-pre-wrap">{task.notes}</p>
          </div>
        )}

        <div>
          <h3 className="mb-2 text-sm font-semibold text-app">Status</h3>
          <div className="flex gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(task.id, s as Status)}
                className={cn(
                  'flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                  task.status === s ? 'border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' : 'border-app text-muted hover:bg-surface-2'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-app pt-4">
          <Link to={`/tasks/${task.id}/edit`}>
            <Button variant="outline" size="sm"><Pencil className="h-4 w-4" />Edit</Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => duplicateTask(task.id)}><Copy className="h-4 w-4" />Duplicate</Button>
          <Button variant="outline" size="sm" onClick={() => archiveTask(task.id)}><Archive className="h-4 w-4" />Archive</Button>
          <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}><Trash2 className="h-4 w-4" />Delete</Button>
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={() => setConfirmDelete(false)}>
          <div className="w-full max-w-sm rounded-2xl border border-app bg-surface p-6 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-2 text-lg font-semibold text-app">Move to trash?</h3>
            <p className="mb-4 text-sm text-muted">This task will be moved to trash. You can restore it later.</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>Cancel</Button>
              <Button variant="danger" size="sm" onClick={async () => { await softDelete(task.id); setConfirmDelete(false); onClose(); }}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

function InfoRow({ icon: Icon, label, value, highlight }: { icon: typeof Clock; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2', highlight && 'bg-rose-100 dark:bg-rose-900/30')}>
        <Icon className={cn('h-4 w-4 text-muted', highlight && 'text-rose-500')} />
      </div>
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className={cn('text-sm font-medium text-app', highlight && 'text-rose-500')}>{value}</p>
      </div>
    </div>
  );
}
