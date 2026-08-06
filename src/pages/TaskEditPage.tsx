import { useParams, Navigate } from 'react-router-dom';
import { useTasks } from '@/hooks/useTasks';
import { TaskForm } from '@/components/tasks/TaskForm';
import { FullPageSpinner } from '@/components/ui/Spinner';

export function TaskEditPage() {
  const { id } = useParams<{ id: string }>();
  const { tasks, loading } = useTasks();
  const task = tasks.find((t) => t.id === id);

  if (loading) return <FullPageSpinner message="Loading task..." />;
  if (!task) return <Navigate to="/tasks" replace />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-app">Edit Task</h1>
        <p className="mt-1 text-sm text-muted">Update the details of your task</p>
      </div>
      <TaskForm task={task} />
    </div>
  );
}
