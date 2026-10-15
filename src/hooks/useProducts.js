import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useRealtimeSubscription } from './useRealtimeSubscription';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('products')
      .select('*, categories(name)')
      .order('name');

    if (err) {
      setError(err.message);
    } else {
      setProducts(data || []);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useRealtimeSubscription('products', {
    onInsert: useCallback(() => {
      fetchProducts();
    }, [fetchProducts]),
    onUpdate: useCallback(() => {
      fetchProducts();
    }, [fetchProducts]),
    onDelete: useCallback((deleted) => {
      setProducts(prev => prev.filter(p => p.id !== deleted.id));
    }, []),
  });

  async function createProduct(productData) {
    const { data, error: err } = await supabase
      .from('products')
      .insert(productData)
      .select('*, categories(name)')
      .single();
    return { data, error: err };
  }

  async function updateProduct(id, updates) {
    const { data, error: err } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select('*, categories(name)')
      .single();
    return { data, error: err };
  }

  async function deleteProduct(id) {
    const { error: err } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    return { error: err };
  }

  async function adjustQuantity(id, newQuantity) {
    return updateProduct(id, { quantity: newQuantity });
  }

  async function getProduct(id) {
    const { data, error: err } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('id', id)
      .single();
    return { data, error: err };
  }

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    adjustQuantity,
    getProduct,
  };
}
