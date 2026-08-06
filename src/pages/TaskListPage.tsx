import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  LayoutGrid,
  Columns3,
  Download,
  Upload,
  Pin,
  Star,
  Archive,
  RotateCcw,
  Trash2,
  Copy,
  Eye,
  Pencil,
  MoreVertical,
  ListTodo,
  Calendar as CalIcon,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { TaskRowSkeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { TaskDetailsModal } from '@/components/tasks/TaskDetailsModal';
import { PRIORITIES, STATUSES, SORT_OPTIONS, PRIORITY_META, STATUS_META } from '@/lib/constants';
import { exportTasksToCSV, parseTasksCSV } from '@/lib/csv';
import { cn, isOverdue, formatDate, paginate, toInputDate } from '@/lib/utils';
import type { Task, Priority, Status, KanbanColumn } from '@/types';

const PAGE_SIZE = 8;

type View = 'list' | 'kanban';
type TrashView = 'active' | 'archived' | 'trash';

export function TaskListPage({ searchQuery }: { searchQuery: string }) {
  const { tasks, loading, setStatus, togglePin, toggleFavorite, archiveTask, restoreTask, softDelete, permanentDelete, duplicateTask, fetchTasks } = useTasks();
  const { categories, createCategory } = useCategories();
  const toast = useToast();

  const [view, setView] = useState<View>('list');
  const [trashView, setTrashView] = useState<TrashView>('active');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [page, setPage] = useState(1);
  const [detailsTask, setDetailsTask] = useState<Task | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories]
  );

  const filtered = useMemo(() => {
    let list = tasks.filter((t) => {
      if (trashView === 'active' && (t.archived || t.deleted)) return false;
      if (trashView === 'archived' && (!t.archived || t.deleted)) return false;
      if (trashView === 'trash' && !t.deleted) return false;
      return true;
    });

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description ?? '').toLowerCase().includes(q)
      );
    }
    if (statusFilter) list = list.filter((t) => t.status === statusFilter);
    if (priorityFilter) list = list.filter((t) => t.priority === priorityFilter);
    if (categoryFilter) list = list.filter((t) => t.category_id === categoryFilter);

    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case 'due_date':
          return (a.due_date ?? '9999').localeCompare(b.due_date ?? '9999');
        case 'priority':
          return PRIORITY_META[a.priority] && PRIORITY_META[b.priority]
            ? (PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority])
            : 0;
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    if (trashView === 'active') {
      list.sort((a, b) => Number(b.pinned) - Number(a.pinned));
    }
    return list;
  }, [tasks, trashView, searchQuery, statusFilter, priorityFilter, categoryFilter, sortBy]);

  const paged = useMemo(() => paginate(filtered, page, PAGE_SIZE), [filtered, page]);

  const kanbanTasks = useMemo(() => {
    const cols: Record<KanbanColumn, Task[]> = { Pending: [], 'In Progress': [], Completed: [] };
    filtered.forEach((t) => cols[t.status].push(t));
    return cols;
  }, [filtered]);

  const handleExport = () => {
    exportTasksToCSV(filtered, categoryMap);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const rows = parseTasksCSV(text);
    let imported = 0;
    for (const row of rows) {
      if (!row.title) continue;
      let catId: string | null = null;
      if (row.category) {
        let existing = categories.find((c) => c.name.toLowerCase() === row.category!.toLowerCase());
        if (!existing) existing = (await createCategory(row.category)) ?? undefined;
        catId = existing?.id ?? null;
      }
      const { error } = await supabase.from('tasks').insert({
        title: row.title,
        description: row.description ?? null,
        priority: (PRIORITIES.includes(row.priority as Priority) ? row.priority : 'Medium') as Priority,
        status: (STATUSES.includes(row.status as Status) ? row.status : 'Pending') as Status,
        due_date: row.due_date ? new Date(row.due_date).toISOString() : null,
        category_id: catId,
        tags: row.tags ?? [],
        estimated_time: row.estimated_time ?? null,
        notes: row.notes ?? null,
      });
      if (!error) imported++;
    }
    await fetchTasks();
    e.target.value = '';
    if (imported > 0) toast(`${imported} task(s) imported successfully`);
    else toast('No valid tasks found in file', 'warning');
  };

  return (
    <div className="space-y-6" onClick={() => setMenuOpen(null)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-app">Tasks</h1>
          <p className="mt-1 text-sm text-muted">Manage and organize all your tasks</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="cursor-pointer">
            <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
            <Button variant="outline" size="sm" type="button">
              <Upload className="h-4 w-4" />
              Import
            </Button>
          </label>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Link to="/tasks/new">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border border-app bg-surface p-1">
          {(['active', 'archived', 'trash'] as TrashView[]).map((v) => (
            <button
              key={v}
              onClick={() => {
                setTrashView(v);
                setPage(1);
              }}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors',
                trashView === v ? 'bg-primary-600 text-white' : 'text-muted hover:text-app'
              )}
            >
              {v === 'active' ? 'Active' : v}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <div className="flex rounded-lg border border-app bg-surface p-1">
          <button
            onClick={() => setView('list')}
            className={cn('rounded-md p-1.5 transition-colors', view === 'list' ? 'bg-primary-600 text-white' : 'text-muted hover:text-app')}
            aria-label="List view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView('kanban')}
            className={cn('rounded-md p-1.5 transition-colors', view === 'kanban' ? 'bg-primary-600 text-white' : 'text-muted hover:text-app')}
            aria-label="Kanban view"
          >
            <Columns3 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {trashView === 'active' && (
        <Card>
          <CardBody className="flex flex-wrap items-center gap-3">
            <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="w-auto">
              <option value="">All Statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }} className="w-auto">
              <option value="">All Priorities</option>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </Select>
            <Select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} className="w-auto">
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-auto">
              {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>Sort: {s.label}</option>)}
            </Select>
            {(statusFilter || priorityFilter || categoryFilter) && (
              <Button variant="ghost" size="sm" onClick={() => { setStatusFilter(''); setPriorityFilter(''); setCategoryFilter(''); }}>
                Clear
              </Button>
            )}
          </CardBody>
        </Card>
      )}

      {loading ? (
        <Card>
          {Array.from({ length: 5 }).map((_, i) => <TaskRowSkeleton key={i} />)}
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ListTodo className="h-7 w-7" />}
            title={trashView === 'trash' ? 'Trash is empty' : trashView === 'archived' ? 'No archived tasks' : 'No tasks found'}
            description={trashView === 'active' ? 'Create your first task to get started.' : undefined}
            action={trashView === 'active' ? (
              <Link to="/tasks/new">
                <Button size="sm"><Plus className="h-4 w-4" />Add Task</Button>
              </Link>
            ) : undefined}
          />
        </Card>
      ) : view === 'kanban' && trashView === 'active' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {(Object.keys(kanbanTasks) as KanbanColumn[]).map((col) => (
            <div key={col} className="rounded-2xl border border-app bg-surface-2 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-app">{STATUS_META[col].label}</h3>
                <Badge className="bg-surface text-muted">{kanbanTasks[col].length}</Badge>
              </div>
              <div className="space-y-2">
                {kanbanTasks[col].map((task) => (
                  <TaskKanbanCard key={task.id} task={task} categoryName={task.category_id ? categoryMap[task.category_id] : undefined} onClick={() => setDetailsTask(task)} onStatusChange={(s) => setStatus(task.id, s)} />
                ))}
                {kanbanTasks[col].length === 0 && (
                  <p className="py-4 text-center text-xs text-muted">No tasks</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <div className="divide-y divide-[var(--border)]">
            {paged.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                categoryName={task.category_id ? categoryMap[task.category_id] : undefined}
                onOpen={() => setDetailsTask(task)}
                onTogglePin={() => togglePin(task.id)}
                onToggleFav={() => toggleFavorite(task.id)}
                onArchive={() => archiveTask(task.id)}
                onRestore={() => restoreTask(task.id)}
                onSoftDelete={() => setConfirmDelete(task.id)}
                onPermDelete={() => setConfirmDelete(task.id)}
                onDuplicate={() => duplicateTask(task.id)}
                menuOpen={menuOpen === task.id}
                setMenuOpen={(v) => setMenuOpen(v ? task.id : null)}
                trashView={trashView}
              />
            ))}
          </div>
          {view === 'list' && (
            <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
          )}
        </Card>
      )}

      {detailsTask && (
        <TaskDetailsModal task={detailsTask} onClose={() => setDetailsTask(null)} />
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={async () => {
          if (!confirmDelete) return;
          if (trashView === 'trash') await permanentDelete(confirmDelete);
          else await softDelete(confirmDelete);
          setConfirmDelete(null);
        }}
        title={trashView === 'trash' ? 'Permanently delete?' : 'Move to trash?'}
        message={trashView === 'trash' ? 'This action cannot be undone. The task will be permanently removed.' : 'The task will be moved to trash. You can restore it later or permanently delete it.'}
        confirmLabel={trashView === 'trash' ? 'Delete Forever' : 'Move to Trash'}
        danger
      />
    </div>
  );
}

interface TaskRowProps {
  task: Task;
  categoryName?: string;
  onOpen: () => void;
  onTogglePin: () => void;
  onToggleFav: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onSoftDelete: () => void;
  onPermDelete: () => void;
  onDuplicate: () => void;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  trashView: TrashView;
}

function TaskRow(props: TaskRowProps) {
  const { task, categoryName, onOpen, onTogglePin, onToggleFav, onArchive, onRestore, onSoftDelete, onPermDelete, onDuplicate, menuOpen, setMenuOpen, trashView } = props;
  const sm = STATUS_META[task.status];
  const pm = PRIORITY_META[task.priority];
  const overdue = isOverdue(task.due_date, task.status);

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-2">
      <button
        onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
        className={cn('shrink-0 transition-colors', task.pinned ? 'text-primary-500' : 'text-muted hover:text-app')}
        title="Pin"
      >
        <Pin className={cn('h-4 w-4', task.pinned && 'fill-current')} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFav(); }}
        className={cn('shrink-0 transition-colors', task.favorite ? 'text-amber-500' : 'text-muted hover:text-app')}
        title="Favorite"
      >
        <Star className={cn('h-4 w-4', task.favorite && 'fill-current')} />
      </button>
      <button onClick={onOpen} className="flex flex-1 items-center gap-3 text-left min-w-0">
        <div className={cn('h-2.5 w-2.5 shrink-0 rounded-full', pm.dot)} />
        <div className="min-w-0 flex-1">
          <p className={cn('truncate font-medium', task.status === 'Completed' ? 'text-muted line-through' : 'text-app')}>
            {task.title}
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            {categoryName && <span className="flex items-center gap-1"><CalIcon className="h-3 w-3" />{categoryName}</span>}
            {task.due_date && (
              <span className={cn('flex items-center gap-1', overdue && 'text-rose-500 font-medium')}>
                <Clock className="h-3 w-3" />{formatDate(task.due_date)}{overdue ? ' (overdue)' : ''}
              </span>
            )}
            {(task.tags ?? []).length > 0 && <span>{(task.tags ?? []).slice(0, 3).join(', ')}</span>}
          </div>
        </div>
      </button>
      <Badge className={cn(sm.bg, sm.color, 'hidden sm:inline-flex')}>{sm.label}</Badge>
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface hover:text-app"
          aria-label="Task actions"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-8 z-30 w-44 rounded-xl border border-app bg-surface py-1 shadow-xl animate-scale-in">
            {trashView === 'trash' ? (
              <>
                <MenuItem icon={RotateCcw} label="Restore" onClick={() => { onRestore(); setMenuOpen(false); }} />
                <MenuItem icon={Trash2} label="Delete Forever" danger onClick={() => { onPermDelete(); setMenuOpen(false); }} />
              </>
            ) : trashView === 'archived' ? (
              <>
                <MenuItem icon={RotateCcw} label="Restore" onClick={() => { onRestore(); setMenuOpen(false); }} />
                <MenuItem icon={Trash2} label="Move to Trash" danger onClick={() => { onSoftDelete(); setMenuOpen(false); }} />
              </>
            ) : (
              <>
                <MenuItem icon={Eye} label="View Details" onClick={() => { onOpen(); setMenuOpen(false); }} />
                <Link to={`/tasks/${task.id}/edit`}>
                  <MenuItem icon={Pencil} label="Edit" onClick={() => setMenuOpen(false)} />
                </Link>
                <MenuItem icon={Copy} label="Duplicate" onClick={() => { onDuplicate(); setMenuOpen(false); }} />
                <MenuItem icon={Archive} label="Archive" onClick={() => { onArchive(); setMenuOpen(false); }} />
                <MenuItem icon={Trash2} label="Move to Trash" danger onClick={() => { onSoftDelete(); setMenuOpen(false); }} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick, danger }: { icon: typeof Eye; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn('flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-surface-2', danger ? 'text-error-500' : 'text-app')}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function TaskKanbanCard({ task, categoryName, onClick, onStatusChange }: { task: Task; categoryName?: string; onClick: () => void; onStatusChange: (s: Status) => void }) {
  const pm = PRIORITY_META[task.priority];
  const overdue = isOverdue(task.due_date, task.status);
  return (
    <div className="group cursor-pointer rounded-xl border border-app bg-surface p-3 transition-shadow hover:shadow-md" onClick={onClick}>
      <div className="mb-2 flex items-start gap-2">
        <div className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', pm.dot)} />
        <p className={cn('flex-1 text-sm font-medium', task.status === 'Completed' ? 'text-muted line-through' : 'text-app')}>{task.title}</p>
      </div>
      {task.description && <p className="mb-2 line-clamp-2 text-xs text-muted">{task.description}</p>}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {categoryName && <Badge className="bg-surface-2 text-muted">{categoryName}</Badge>}
        {task.due_date && (
          <span className={cn('flex items-center gap-1', overdue ? 'text-rose-500' : 'text-muted')}>
            <Clock className="h-3 w-3" />{formatDate(task.due_date)}
          </span>
        )}
      </div>
      <div className="mt-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={(e) => { e.stopPropagation(); onStatusChange(s); }}
            className={cn(
              'flex-1 rounded-md py-1 text-[10px] font-medium transition-colors',
              task.status === s ? 'bg-primary-600 text-white' : 'bg-surface-2 text-muted hover:text-app'
            )}
          >
            {s === 'Pending' ? 'Pending' : s === 'In Progress' ? 'Progress' : 'Done'}
          </button>
        ))}
      </div>
    </div>
  );
}
