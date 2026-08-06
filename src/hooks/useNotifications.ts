import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Notification } from '@/types';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);
    if (error) return;
    setNotifications(data ?? []);
    setUnreadCount((data ?? []).filter((n) => !n.read).length);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ read: true }).eq('read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearAll = async () => {
    if (!user) return;
    await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    setNotifications([]);
    setUnreadCount(0);
  };

  return { notifications, loading, unreadCount, fetchNotifications, markRead, markAllRead, clearAll };
}
