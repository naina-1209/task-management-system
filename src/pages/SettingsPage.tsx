import { Sun, Moon, Bell, User, Keyboard } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const SHORTCUTS = [
  { keys: 'g then d', label: 'Go to Dashboard' },
  { keys: 'g then t', label: 'Go to Tasks' },
  { keys: 'g then c', label: 'Go to Calendar' },
  { keys: 'n', label: 'New Task' },
  { keys: '/', label: 'Focus Search' },
  { keys: 'Esc', label: 'Close Modal' },
];

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const toast = useToast();

  const handleNotifToggle = (key: string) => {
    toast(`${key} notifications ${Math.random() > 0.5 ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-app">Settings</h1>
        <p className="mt-1 text-sm text-muted">Customize your TaskFlow experience</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-4 w-4" /> Appearance
          </CardTitle>
        </CardHeader>
        <CardBody>
          <p className="mb-3 text-sm text-muted">Choose your preferred theme</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTheme('light')}
              className={cn(
                'flex items-center gap-3 rounded-xl border-2 p-4 transition-colors',
                theme === 'light' ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/10' : 'border-app hover:bg-surface-2'
              )}
            >
              <Sun className="h-5 w-5 text-amber-500" />
              <div className="text-left">
                <p className="font-medium text-app">Light Mode</p>
                <p className="text-xs text-muted">Bright and clean</p>
              </div>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={cn(
                'flex items-center gap-3 rounded-xl border-2 p-4 transition-colors',
                theme === 'dark' ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/10' : 'border-app hover:bg-surface-2'
              )}
            >
              <Moon className="h-5 w-5 text-indigo-400" />
              <div className="text-left">
                <p className="font-medium text-app">Dark Mode</p>
                <p className="text-xs text-muted">Easy on the eyes</p>
              </div>
            </button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4" /> Notification Settings
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          {[
            { key: 'Task Created', desc: 'Notify when a new task is created' },
            { key: 'Task Completed', desc: 'Notify when a task is marked complete' },
            { key: 'Due Today', desc: 'Notify when a task is due today' },
            { key: 'Overdue', desc: 'Notify when a task becomes overdue' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between rounded-lg bg-surface-2 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-app">{item.key}</p>
                <p className="text-xs text-muted">{item.desc}</p>
              </div>
              <ToggleSwitch onChange={() => handleNotifToggle(item.key)} defaultOn />
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-4 w-4" /> Account Settings
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-surface-2 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-app">Email Notifications</p>
              <p className="text-xs text-muted">Receive emails about your tasks</p>
            </div>
            <ToggleSwitch onChange={() => toast('Email notifications toggled')} />
          </div>
          <div className="flex items-center justify-between rounded-lg bg-surface-2 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-app">Session Timeout</p>
              <p className="text-xs text-muted">Auto sign-out after inactivity</p>
            </div>
            <ToggleSwitch onChange={() => toast('Session timeout toggled')} defaultOn />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="h-4 w-4" /> Keyboard Shortcuts
          </CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {SHORTCUTS.map((s) => (
              <div key={s.label} className="flex items-center justify-between rounded-lg bg-surface-2 px-4 py-2.5">
                <span className="text-sm text-app">{s.label}</span>
                <kbd className="rounded-md border border-app bg-surface px-2 py-1 text-xs font-medium text-muted">{s.keys}</kbd>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function ToggleSwitch({ onChange, defaultOn }: { onChange: () => void; defaultOn?: boolean }) {
  return (
    <button
      onClick={onChange}
      className={cn(
        'relative h-6 w-11 rounded-full transition-colors',
        defaultOn ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
          defaultOn ? 'translate-x-5' : 'translate-x-0.5'
        )}
      />
    </button>
  );
}
