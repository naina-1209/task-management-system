import { TaskForm } from '@/components/tasks/TaskForm';

export function TaskCreatePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-app">Create New Task</h1>
        <p className="mt-1 text-sm text-muted">Add a new task to your workspace</p>
      </div>
      <TaskForm />
    </div>
  );
}
