import { useState, type FormEvent } from 'react';
import { Plus, Pencil, Trash2, FolderKanban, X } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { useTasks } from '@/hooks/useTasks';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';

export function CategoriesPage() {
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useCategories();
  const { tasks } = useTasks();
  const [newName, setNewName] = useState('');
  const [editCat, setEditCat] = useState<{ id: string; name: string } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const taskCount = (catId: string) => tasks.filter((t) => t.category_id === catId && !t.deleted).length;

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await createCategory(newName.trim());
    setNewName('');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-app">Categories</h1>
        <p className="mt-1 text-sm text-muted">Organize your tasks into categories</p>
      </div>

      <Card>
        <CardBody>
          <form onSubmit={handleCreate} className="flex gap-2">
            <Input
              name="newCategory"
              placeholder="Add a new category..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Button type="submit" disabled={!newName.trim()}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </form>
        </CardBody>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : categories.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FolderKanban className="h-7 w-7" />}
            title="No categories yet"
            description="Create categories like Work, Personal, or Shopping to organize your tasks."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {categories.map((cat) => (
            <Card key={cat.id} className="transition-shadow hover:shadow-md">
              <CardBody className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400">
                    <FolderKanban className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-app">{cat.name}</p>
                    <p className="text-xs text-muted">{taskCount(cat.id)} task{taskCount(cat.id) !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setEditCat({ id: cat.id, name: cat.name })} aria-label="Edit">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(cat.id)} aria-label="Delete">
                    <Trash2 className="h-4 w-4 text-error-500" />
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {editCat && (
        <Modal open onClose={() => setEditCat(null)} title="Edit Category" size="sm">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!editCat.name.trim()) return;
              await updateCategory(editCat.id, editCat.name.trim());
              setEditCat(null);
            }}
            className="p-6 space-y-4"
          >
            <Input
              label="Category Name"
              value={editCat.name}
              onChange={(e) => setEditCat({ ...editCat, name: e.target.value })}
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setEditCat(null)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) await deleteCategory(deleteId);
          setDeleteId(null);
        }}
        title="Delete category?"
        message="Tasks in this category will remain but lose their category label. This cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
