import type { Priority, Status, SortOption } from '@/types';

export const PRIORITIES: Priority[] = ['Low', 'Medium', 'High'];
export const STATUSES: Status[] = ['Pending', 'In Progress', 'Completed'];

export const PRIORITY_META: Record<Priority, { color: string; dot: string; label: string }> = {
  Low: { color: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500', label: 'Low' },
  Medium: { color: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500', label: 'Medium' },
  High: { color: 'text-rose-600 dark:text-rose-400', dot: 'bg-rose-500', label: 'High' },
};

export const STATUS_META: Record<Status, { color: string; bg: string; label: string }> = {
  Pending: { color: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-700', label: 'Pending' },
  'In Progress': { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/40', label: 'In Progress' },
  Completed: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/40', label: 'Completed' },
};

export const SORT_OPTIONS: SortOption[] = [
  { value: 'due_date', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'recent', label: 'Recently Created' },
  { value: 'alphabetical', label: 'Alphabetical' },
];

export const PRIORITY_RANK: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };

export const NOTIFICATION_META: Record<string, { color: string; icon: string }> = {
  task_created: { color: 'text-blue-500', icon: 'Plus' },
  task_updated: { color: 'text-amber-500', icon: 'Pencil' },
  task_deleted: { color: 'text-rose-500', icon: 'Trash2' },
  task_completed: { color: 'text-emerald-500', icon: 'CheckCircle2' },
  due_today: { color: 'text-orange-500', icon: 'Clock' },
  overdue: { color: 'text-red-500', icon: 'AlertTriangle' },
};
