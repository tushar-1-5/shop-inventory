import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useRealtimeSubscription } from './useRealtimeSubscription';

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (err) {
      setError(err.message);
    } else {
      setCategories(data || []);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useRealtimeSubscription('categories', {
    onInsert: useCallback((newCat) => {
      setCategories(prev => {
        if (prev.some(c => c.id === newCat.id)) return prev;
        return [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name));
      });
    }, []),
    onUpdate: useCallback((updated) => {
      setCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
    }, []),
    onDelete: useCallback((deleted) => {
      setCategories(prev => prev.filter(c => c.id !== deleted.id));
    }, []),
  });

  async function createCategory(name, description = '') {
    const { data, error: err } = await supabase
      .from('categories')
      .insert({ name: name.trim(), description: description.trim() })
      .select()
      .single();
    return { data, error: err };
  }

  async function updateCategory(id, updates) {
    const { data, error: err } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error: err };
  }

  async function deleteCategory(id) {
    const { error: err } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    return { error: err };
  }

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
