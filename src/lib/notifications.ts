import { supabase } from './supabase';
import type { NotificationType } from '@/types';

export async function addNotification(type: NotificationType, message: string, taskId: string | null = null) {
  await supabase.from('notifications').insert({ type, message, task_id: taskId });
}

export async function generateDueDateNotifications(tasks: { id: string; title: string; due_date: string | null; status: string }[]) {
  const now = Date.now();
  for (const task of tasks) {
    if (!task.due_date || task.status === 'Completed') continue;
    const due = new Date(task.due_date).getTime();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    if (due < startOfToday.getTime()) {
      const { data } = await supabase
        .from('notifications')
        .select('id')
        .eq('task_id', task.id)
        .eq('type', 'overdue')
        .maybeSingle();
      if (!data) await addNotification('overdue', `Task "${task.title}" is overdue`, task.id);
    } else if (due >= startOfToday.getTime() && due < now + 86400000) {
      const { data } = await supabase
        .from('notifications')
        .select('id')
        .eq('task_id', task.id)
        .eq('type', 'due_today')
        .maybeSingle();
      if (!data) await addNotification('due_today', `Task "${task.title}" is due today`, task.id);
    }
  }
}
