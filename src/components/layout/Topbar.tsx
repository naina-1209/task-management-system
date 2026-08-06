import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, Sun, Moon, LogOut, CheckCheck, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotifications } from '@/hooks/useNotifications';
import { Avatar } from '@/components/ui/Avatar';
import { cn, relativeTime } from '@/lib/utils';
import { NOTIFICATION_META } from '@/lib/constants';
import * as Icons from 'lucide-react';

interface TopbarProps {
  onMenuClick: () => void;
  onSearch: (q: string) => void;
  searchQuery: string;
}

export function Topbar({ onMenuClick, onSearch, searchQuery }: TopbarProps) {
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markRead, markAllRead, clearAll } = useNotifications();
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-app bg-surface/80 px-4 backdrop-blur-md lg:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-app lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search tasks..."
          className="h-10 w-full rounded-lg border border-app bg-surface-2 pl-10 pr-4 text-sm text-app placeholder:text-muted transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      <button
        onClick={toggleTheme}
        className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-app"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </button>

      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setNotifOpen((p) => !p)}
          className="relative rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-app"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-error-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {notifOpen && (
          <div className="absolute right-0 mt-2 w-80 rounded-xl border border-app bg-surface shadow-xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-app px-4 py-3">
              <p className="text-sm font-semibold text-app">Notifications</p>
              <div className="flex gap-1">
                <button
                  onClick={markAllRead}
                  className="rounded p-1 text-muted hover:bg-surface-2 hover:text-app"
                  title="Mark all read"
                >
                  <CheckCheck className="h-4 w-4" />
                </button>
                <button
                  onClick={clearAll}
                  className="rounded p-1 text-muted hover:bg-surface-2 hover:text-app"
                  title="Clear all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted">No notifications</p>
              ) : (
                notifications.map((n) => {
                  const meta = NOTIFICATION_META[n.type];
                  const Icon = (Icons as Record<string, typeof Icons.Bell>)[meta?.icon ?? 'Bell'] ?? Icons.Bell;
                  return (
                    <button
                      key={n.id}
                      onClick={() => {
                        markRead(n.id);
                        if (n.task_id) navigate('/tasks');
                      }}
                      className={cn(
                        'flex w-full items-start gap-3 border-b border-app px-4 py-3 text-left transition-colors hover:bg-surface-2',
                        !n.read && 'bg-primary-50/50 dark:bg-primary-900/10'
                      )}
                    >
                      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', meta?.color)} />
                      <div className="flex-1">
                        <p className="text-sm text-app">{n.message}</p>
                        <p className="text-xs text-muted">{relativeTime(n.created_at)}</p>
                      </div>
                      {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-500" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-surface-2"
        >
          <Avatar name={profile?.name || 'User'} url={profile?.avatar_url} size="sm" />
          <span className="hidden text-sm font-medium text-app sm:block">
            {profile?.name || 'User'}
          </span>
        </button>
        <button
          onClick={signOut}
          className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-app"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
