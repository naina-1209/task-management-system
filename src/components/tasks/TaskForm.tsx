import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Card, CardBody } from '@/components/ui/Card';
import { PRIORITIES, STATUSES } from '@/lib/constants';
import { toInputDate } from '@/lib/utils';
import type { Task, TaskInput, Priority, Status } from '@/types';

interface TaskFormProps {
  task?: Task;
}

export function TaskForm({ task }: TaskFormProps) {
  const { createTask, updateTask } = useTasks();
  const { categories } = useCategories();
  const navigate = useNavigate();
  const isEdit = Boolean(task);

  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'Medium');
  const [status, setStatus] = useState<Status>(task?.status ?? 'Pending');
  const [dueDate, setDueDate] = useState(toInputDate(task?.due_date ?? null));
  const [categoryId, setCategoryId] = useState(task?.category_id ?? '');
  const [tags, setTags] = useState((task?.tags ?? []).join(', '));
  const [estimatedTime, setEstimatedTime] = useState(task?.estimated_time?.toString() ?? '');
  const [notes, setNotes] = useState(task?.notes ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const input: TaskInput = {
      title: title.trim(),
      description: description.trim() || null,
      priority,
      status,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      category_id: categoryId || null,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      estimated_time: estimatedTime ? Number(estimatedTime) : null,
      notes: notes.trim() || null,
    };

    setSaving(true);
    const result = isEdit && task ? await updateTask(task.id, input) : await createTask(input);
    setSaving(false);
    if (result) navigate('/tasks');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardBody className="space-y-5">
          <Input
            label="Title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            error={errors.title}
          />
          <Textarea
            label="Description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more details..."
            rows={3}
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Select label="Priority" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </Select>
            <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as Status)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
            <Input
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <Select label="Category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
          <Input
            label="Tags (comma separated)"
            name="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="urgent, backend, design"
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              label="Estimated Time (minutes)"
              type="number"
              min="0"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
              placeholder="60"
            />
          </div>
          <Textarea
            label="Notes"
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Private notes..."
            rows={2}
          />
        </CardBody>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? 'Save Changes' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}
