import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ListTodo,
  Calendar,
  FolderKanban,
  User,
  Settings,
  CheckSquare,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'Tasks', icon: ListTodo },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/categories', label: 'Categories', icon: FolderKanban },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-app bg-sidebar transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm">
              <CheckSquare className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-app">TaskFlow</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-app lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-muted hover:bg-surface-2 hover:text-app'
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-app p-4">
          <p className="text-xs text-muted">TaskFlow v1.0</p>
        </div>
      </aside>
    </>
  );
}
