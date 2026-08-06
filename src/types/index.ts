export type Priority = 'Low' | 'Medium' | 'High';
export type Status = 'Pending' | 'In Progress' | 'Completed';
export type KanbanColumn = 'Pending' | 'In Progress' | 'Completed';

export interface Category {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  status: Status;
  due_date: string | null;
  category_id: string | null;
  tags: string[] | null;
  estimated_time: number | null;
  notes: string | null;
  archived: boolean;
  deleted: boolean;
  pinned: boolean;
  favorite: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  category?: Category | null;
}

export interface TaskInput {
  title: string;
  description?: string | null;
  priority?: Priority;
  status?: Status;
  due_date?: string | null;
  category_id?: string | null;
  tags?: string[];
  estimated_time?: number | null;
  notes?: string | null;
}

export interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
}

export type NotificationType =
  | 'task_created'
  | 'task_updated'
  | 'task_deleted'
  | 'task_completed'
  | 'due_today'
  | 'overdue';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  message: string;
  task_id: string | null;
  read: boolean;
  created_at: string;
}

export interface DashboardStats {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  overdue: number;
  completionPct: number;
}

export interface SortOption {
  value: string;
  label: string;
}
