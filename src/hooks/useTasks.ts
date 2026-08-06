import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { addNotification } from '@/lib/notifications';
import type { Task, TaskInput, Status } from '@/types';

export function useTasks() {
  const { user } = useAuth();
  const toast = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*, category:categories(*)')
      .order('created_at', { ascending: false });
    if (error) {
      setError(error.message);
    } else {
      setTasks((data ?? []) as Task[]);
      setError(null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (input: TaskInput): Promise<Task | null> => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...input, tags: input.tags ?? [] })
      .select('*, category:categories(*)')
      .single();
    if (error) {
      toast(`Failed to create task: ${error.message}`, 'error');
      return null;
    }
    setTasks((prev) => [data as Task, ...prev]);
    await addNotification('task_created', `Task "${data.title}" created`, data.id);
    toast('Task created successfully');
    return data as Task;
  };

  const updateTask = async (id: string, updates: Partial<TaskInput>): Promise<Task | null> => {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select('*, category:categories(*)')
      .single();
    if (error) {
      toast(`Failed to update task: ${error.message}`, 'error');
      return null;
    }
    setTasks((prev) => prev.map((t) => (t.id === id ? (data as Task) : t)));
    await addNotification('task_updated', `Task "${data.title}" updated`, data.id);
    toast('Task updated successfully');
    return data as Task;
  };

  const setStatus = async (id: string, status: Status) => {
    const task = tasks.find((t) => t.id === id);
    const { data, error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', id)
      .select('*, category:categories(*)')
      .single();
    if (error) {
      toast(`Failed to update status: ${error.message}`, 'error');
      return;
    }
    setTasks((prev) => prev.map((t) => (t.id === id ? (data as Task) : t)));
    if (status === 'Completed') {
      await addNotification('task_completed', `Task "${data.title}" completed`, data.id);
      toast('Task marked complete');
    }
    void task;
  };

  const togglePin = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const { data, error } = await supabase
      .from('tasks')
      .update({ pinned: !task.pinned })
      .eq('id', id)
      .select('*, category:categories(*)')
      .single();
    if (error) return toast(`Failed: ${error.message}`, 'error');
    setTasks((prev) => prev.map((t) => (t.id === id ? (data as Task) : t)));
  };

  const toggleFavorite = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const { data, error } = await supabase
      .from('tasks')
      .update({ favorite: !task.favorite })
      .eq('id', id)
      .select('*, category:categories(*)')
      .single();
    if (error) return toast(`Failed: ${error.message}`, 'error');
    setTasks((prev) => prev.map((t) => (t.id === id ? (data as Task) : t)));
  };

  const archiveTask = async (id: string) => {
    const { error } = await supabase.from('tasks').update({ archived: true }).eq('id', id);
    if (error) return toast(`Failed to archive: ${error.message}`, 'error');
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, archived: true } : t)));
    toast('Task archived');
  };

  const restoreTask = async (id: string) => {
    const { error } = await supabase.from('tasks').update({ archived: false, deleted: false }).eq('id', id);
    if (error) return toast(`Failed to restore: ${error.message}`, 'error');
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, archived: false, deleted: false } : t)));
    toast('Task restored');
  };

  const softDelete = async (id: string) => {
    const { error } = await supabase.from('tasks').update({ deleted: true }).eq('id', id);
    if (error) return toast(`Failed to delete: ${error.message}`, 'error');
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, deleted: true } : t)));
    const task = tasks.find((t) => t.id === id);
    await addNotification('task_deleted', `Task "${task?.title ?? ''}" deleted`, id);
    toast('Task moved to trash');
  };

  const permanentDelete = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) return toast(`Failed to delete: ${error.message}`, 'error');
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast('Task permanently deleted');
  };

  const duplicateTask = async (id: string): Promise<Task | null> => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return null;
    const { title, description, priority, due_date, category_id, tags, estimated_time, notes } = task;
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: `${title} (Copy)`,
        description,
        priority,
        status: 'Pending',
        due_date,
        category_id,
        tags: tags ?? [],
        estimated_time,
        notes,
      })
      .select('*, category:categories(*)')
      .single();
    if (error) {
      toast(`Failed to duplicate: ${error.message}`, 'error');
      return null;
    }
    setTasks((prev) => [data as Task, ...prev]);
    toast('Task duplicated');
    return data as Task;
  };

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    setStatus,
    togglePin,
    toggleFavorite,
    archiveTask,
    restoreTask,
    softDelete,
    permanentDelete,
    duplicateTask,
  };
}
