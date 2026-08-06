import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { TaskDetailsModal } from '@/components/tasks/TaskDetailsModal';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import { PRIORITY_META, STATUS_META } from '@/lib/constants';
import { cn, isOverdue, formatDate, formatDateTime } from '@/lib/utils';
import { useState, useEffect } from 'react';
import type { Task } from '@/types';

export function TaskDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { tasks, loading } = useTasks();
  const { categories } = useCategories();
  const [modalOpen, setModalOpen] = useState(false);
  const task = tasks.find((t) => t.id === id);

  useEffect(() => {
    setModalOpen(true);
  }, []);

  if (loading) return <FullPageSpinner message="Loading task..." />;
  if (!task) return <Navigate to="/tasks" replace />;

  const pm = PRIORITY_META[task.priority];
  const sm = STATUS_META[task.status];
  const categoryName = task.category_id ? categories.find((c) => c.id === task.category_id)?.name : undefined;
  const overdue = isOverdue(task.due_date, task.status);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/tasks">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" />Back to Tasks</Button>
        </Link>
        <Link to={`/tasks/${task.id}/edit`}>
          <Button size="sm"><Pencil className="h-4 w-4" />Edit Task</Button>
        </Link>
      </div>

      <Card>
        <CardBody className="space-y-5">
          <h1 className={cn('text-2xl font-bold', task.status === 'Completed' ? 'text-muted line-through' : 'text-app')}>
            {task.title}
          </h1>
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
            {task.due_date && <div><p className="text-xs text-muted">Due Date</p><p className={cn('text-sm font-medium', overdue && 'text-rose-500')}>{formatDate(task.due_date)}</p></div>}
            {task.estimated_time != null && <div><p className="text-xs text-muted">Estimated Time</p><p className="text-sm font-medium text-app">{task.estimated_time} min</p></div>}
            <div><p className="text-xs text-muted">Created</p><p className="text-sm font-medium text-app">{formatDateTime(task.created_at)}</p></div>
            <div><p className="text-xs text-muted">Updated</p><p className="text-sm font-medium text-app">{formatDateTime(task.updated_at)}</p></div>
          </div>
          {(task.tags ?? []).length > 0 && (
            <div>
              <h3 className="mb-1.5 text-sm font-semibold text-app">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {(task.tags ?? []).map((tag) => <Badge key={tag} className="bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">{tag}</Badge>)}
              </div>
            </div>
          )}
          {task.notes && (
            <div>
              <h3 className="mb-1.5 text-sm font-semibold text-app">Notes</h3>
              <p className="rounded-lg bg-surface-2 p-3 text-sm text-muted whitespace-pre-wrap">{task.notes}</p>
            </div>
          )}
        </CardBody>
      </Card>

      {modalOpen && (
        <TaskDetailsModal task={task as Task} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}
