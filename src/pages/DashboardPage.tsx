import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ListTodo,
  CheckCircle2,
  Clock,
  Loader,
  AlertTriangle,
  TrendingUp,
  Plus,
  Flame,
  Pin,
  Star,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { DistributionChart, WeeklyChart } from '@/components/charts/Charts';
import { PRIORITY_META, STATUS_META } from '@/lib/constants';
import { isOverdue, isDueToday, relativeTime, cn } from '@/lib/utils';
import type { Task } from '@/types';

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: typeof ListTodo;
  color: string;
}) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardBody className="flex items-center gap-4">
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', color)}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-muted">{label}</p>
          <p className="text-2xl font-bold text-app">{value}</p>
        </div>
      </CardBody>
    </Card>
  );
}

function computeStreak(tasks: Task[]): number {
  const completedDays = new Set(
    tasks
      .filter((t) => t.completed_at)
      .map((t) => new Date(t.completed_at!).toDateString())
  );
  let streak = 0;
  const day = new Date();
  if (!completedDays.has(day.toDateString())) {
    day.setDate(day.getDate() - 1);
  }
  while (completedDays.has(day.toDateString())) {
    streak++;
    day.setDate(day.getDate() - 1);
  }
  return streak;
}

export function DashboardPage() {
  const { profile } = useAuth();
  const { tasks, loading } = useTasks();

  const activeTasks = useMemo(() => tasks.filter((t) => !t.archived && !t.deleted), [tasks]);

  const stats = useMemo(() => {
    const total = activeTasks.length;
    const completed = activeTasks.filter((t) => t.status === 'Completed').length;
    const pending = activeTasks.filter((t) => t.status === 'Pending').length;
    const inProgress = activeTasks.filter((t) => t.status === 'In Progress').length;
    const overdue = activeTasks.filter((t) => isOverdue(t.due_date, t.status)).length;
    const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, inProgress, overdue, completionPct };
  }, [activeTasks]);

  const weeklyData = useMemo(() => {
    const labels: string[] = [];
    const data: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      labels.push(day.toLocaleDateString('en-US', { weekday: 'short' }));
      const count = activeTasks.filter(
        (t) => t.completed_at && new Date(t.completed_at).toDateString() === day.toDateString()
      ).length;
      data.push(count);
    }
    return { labels, data };
  }, [activeTasks]);

  const recentActivities = useMemo(() => {
    return [...tasks]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 6);
  }, [tasks]);

  const pinnedTasks = useMemo(() => activeTasks.filter((t) => t.pinned).slice(0, 4), [activeTasks]);
  const streak = useMemo(() => computeStreak(tasks), [tasks]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-app">
            Welcome back, {profile?.name?.split(' ')[0] || 'User'}!
          </h1>
          <p className="mt-1 text-sm text-muted">
            Here's an overview of your tasks and progress.
          </p>
        </div>
        <Link to="/tasks/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard label="Total Tasks" value={stats.total} icon={ListTodo} color="bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400" />
            <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400" />
            <StatCard label="Pending" value={stats.pending} icon={Clock} color="bg-slate-100 text-slate-600 dark:bg-slate-700/40 dark:text-slate-300" />
            <StatCard label="In Progress" value={stats.inProgress} icon={Loader} color="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" />
            <StatCard label="Overdue" value={stats.overdue} icon={AlertTriangle} color="bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400" />
            <Card className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
              <CardBody className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Completion</p>
                  <p className="text-2xl font-bold">{stats.completionPct}%</p>
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Task Distribution</CardTitle>
              </CardHeader>
              <CardBody>
                <DistributionChart
                  pending={stats.pending}
                  inProgress={stats.inProgress}
                  completed={stats.completed}
                />
              </CardBody>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Weekly Completed Tasks</CardTitle>
              </CardHeader>
              <CardBody>
                <WeeklyChart data={weeklyData.data} labels={weeklyData.labels} />
              </CardBody>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Recent Activities</CardTitle>
                <Link to="/tasks" className="text-sm font-medium text-primary-600 hover:underline">
                  View all
                </Link>
              </CardHeader>
              <CardBody className="p-0">
                {recentActivities.length === 0 ? (
                  <EmptyState
                    icon={<ListTodo className="h-7 w-7" />}
                    title="No recent activity"
                    description="Create your first task to get started."
                    action={
                      <Link to="/tasks/new">
                        <Button size="sm">
                          <Plus className="h-4 w-4" />
                          Add Task
                        </Button>
                      </Link>
                    }
                  />
                ) : (
                  <div className="divide-y divide-[var(--border)]">
                    {recentActivities.map((task) => {
                      const sm = STATUS_META[task.status];
                      const pm = PRIORITY_META[task.priority];
                      return (
                        <Link
                          to={`/tasks/${task.id}`}
                          key={task.id}
                          className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-2"
                        >
                          <div className={cn('h-2 w-2 shrink-0 rounded-full', pm.dot)} />
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium text-app">{task.title}</p>
                            <p className="text-xs text-muted">Updated {relativeTime(task.updated_at)}</p>
                          </div>
                          <Badge className={cn(sm.bg, sm.color)}>{sm.label}</Badge>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardBody>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Completion Progress</CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="mb-2 flex items-end justify-between">
                    <span className="text-3xl font-bold text-app">{stats.completionPct}%</span>
                    <span className="text-sm text-muted">
                      {stats.completed} of {stats.total}
                    </span>
                  </div>
                  <ProgressBar value={stats.completionPct} color="bg-emerald-500" />
                  <p className="mt-3 text-sm text-muted">
                    {stats.completionPct === 100
                      ? 'All tasks completed! Great job!'
                      : `${stats.total - stats.completed} tasks remaining to complete.`}
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Streak & Pinned</CardTitle>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div className="flex items-center gap-3 rounded-xl bg-orange-500/10 px-4 py-3">
                    <Flame className="h-6 w-6 text-orange-500" />
                    <div>
                      <p className="text-lg font-bold text-app">{streak} day{streak !== 1 ? 's' : ''}</p>
                      <p className="text-xs text-muted">Completion streak</p>
                    </div>
                  </div>
                  {pinnedTasks.length > 0 ? (
                    <div className="space-y-2">
                      {pinnedTasks.map((t) => (
                        <Link
                          to={`/tasks/${t.id}`}
                          key={t.id}
                          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-surface-2"
                        >
                          <Pin className="h-3.5 w-3.5 text-primary-500" />
                          <span className="flex-1 truncate text-app">{t.title}</span>
                          {t.favorite && <Star className="h-3.5 w-3.5 text-amber-500" />}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted">No pinned tasks. Pin important tasks to see them here.</p>
                  )}
                </CardBody>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
