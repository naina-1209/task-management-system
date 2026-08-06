import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TaskDetailsModal } from '@/components/tasks/TaskDetailsModal';
import { PRIORITY_META } from '@/lib/constants';
import { cn, isOverdue } from '@/lib/utils';
import type { Task } from '@/types';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarPage() {
  const { tasks } = useTasks();
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const activeTasks = useMemo(() => tasks.filter((t) => !t.archived && !t.deleted), [tasks]);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of activeTasks) {
      if (!t.due_date) continue;
      const key = new Date(t.due_date).toDateString();
      const list = map.get(key) ?? [];
      list.push(t);
      map.set(key, list);
    }
    return map;
  }, [activeTasks]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toDateString();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const prevMonth = () => setCursor(new Date(year, month - 1, 1));
  const nextMonth = () => setCursor(new Date(year, month + 1, 1));
  const goToday = () => setCursor(new Date());

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-app">Calendar</h1>
          <p className="mt-1 text-sm text-muted">View your tasks by due date</p>
        </div>
        <Button variant="outline" size="sm" onClick={goToday}>Today</Button>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>{cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="h-5 w-5" /></Button>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="grid grid-cols-7 border-b border-app">
            {WEEKDAYS.map((d) => (
              <div key={d} className="px-2 py-2 text-center text-xs font-semibold text-muted">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((date, idx) => {
              if (!date) return <div key={idx} className="min-h-24 border-b border-r border-app bg-surface-2/50" />;
              const key = date.toDateString();
              const dayTasks = tasksByDay.get(key) ?? [];
              const isToday = key === today;
              return (
                <div key={idx} className={cn('min-h-24 border-b border-r border-app p-1.5', isToday && 'bg-primary-50/50 dark:bg-primary-900/10')}>
                  <div className={cn('mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium', isToday ? 'bg-primary-600 text-white' : 'text-muted')}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map((t) => {
                      const pm = PRIORITY_META[t.priority];
                      const overdue = isOverdue(t.due_date, t.status);
                      return (
                        <button
                          key={t.id}
                          onClick={() => setSelectedTask(t)}
                          className={cn(
                            'block w-full truncate rounded-md px-1.5 py-0.5 text-left text-[11px] font-medium transition-colors',
                            overdue ? 'bg-rose-100 text-rose-600 hover:bg-rose-200 dark:bg-rose-900/40 dark:text-rose-300' : 'bg-surface-2 text-app hover:bg-surface'
                          )}
                          title={t.title}
                        >
                          <span className={cn('mr-1 inline-block h-1.5 w-1.5 rounded-full', pm.dot)} />
                          {t.title}
                        </button>
                      );
                    })}
                    {dayTasks.length > 3 && (
                      <p className="px-1.5 text-[10px] text-muted">+{dayTasks.length - 3} more</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {selectedTask && (
        <TaskDetailsModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  );
}
