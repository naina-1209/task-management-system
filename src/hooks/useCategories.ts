import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import type { Category } from '@/types';

export function useCategories() {
  const { user } = useAuth();
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (error) {
      toast(`Failed to load categories: ${error.message}`, 'error');
    } else {
      setCategories(data ?? []);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = async (name: string): Promise<Category | null> => {
    const { data, error } = await supabase.from('categories').insert({ name }).select().single();
    if (error) {
      toast(`Failed to create category: ${error.message}`, 'error');
      return null;
    }
    setCategories((prev) => [...prev, data as Category].sort((a, b) => a.name.localeCompare(b.name)));
    toast('Category created');
    return data as Category;
  };

  const updateCategory = async (id: string, name: string) => {
    const { data, error } = await supabase.from('categories').update({ name }).eq('id', id).select().single();
    if (error) return toast(`Failed to update: ${error.message}`, 'error');
    setCategories((prev) =>
      [...prev.map((c) => (c.id === id ? (data as Category) : c))].sort((a, b) => a.name.localeCompare(b.name))
    );
    toast('Category updated');
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) return toast(`Failed to delete: ${error.message}`, 'error');
    setCategories((prev) => prev.filter((c) => c.id !== id));
    toast('Category deleted');
  };

  return { categories, loading, fetchCategories, createCategory, updateCategory, deleteCategory };
}
