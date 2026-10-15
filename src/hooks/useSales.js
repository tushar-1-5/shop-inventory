import { useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';

const SALES_PAGE_SIZE = 50;

export function useSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const fetchSales = useCallback(async (filters = {}, reset = true) => {
    setLoading(true);
    const currentOffset = reset ? 0 : offset;

    let query = supabase
      .from('sales')
      .select('*, products(name, brand_name), profiles(display_name)')
      .order('sold_at', { ascending: false })
      .range(currentOffset, currentOffset + SALES_PAGE_SIZE - 1);

    if (filters.startDate) {
      query = query.gte('sold_at', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('sold_at', filters.endDate + 'T23:59:59');
    }
    if (filters.productId) {
      query = query.eq('product_id', filters.productId);
    }

    const { data, error: err } = await query;

    if (err) {
      setError(err.message);
    } else {
      if (reset) {
        setSales(data || []);
        setOffset(SALES_PAGE_SIZE);
      } else {
        setSales(prev => [...prev, ...(data || [])]);
        setOffset(prev => prev + SALES_PAGE_SIZE);
      }
      setHasMore((data || []).length === SALES_PAGE_SIZE);
      setError(null);
    }
    setLoading(false);
  }, [offset]);

  const loadMore = useCallback((filters) => {
    fetchSales(filters, false);
  }, [fetchSales]);

  async function logSale({ product_id, quantity, selling_price }) {
    const total = quantity * selling_price;
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    const { data, error: err } = await supabase
      .from('sales')
      .insert({ product_id, quantity, unit_price: selling_price, total, sold_by: userId })
      .select('*, products(name, brand_name), profiles(display_name)')
      .single();

    if (err) return { data: null, error: err };

    const { error: updateErr } = await supabase.rpc('deduct_stock', {
      p_id: product_id,
      qty: quantity,
    });

    if (updateErr) return { data, error: updateErr };

    const productName = data.products?.name || '';
    await supabase.from('activity_log').insert({
      action: 'sale_logged',
      entity_type: 'product',
      entity_id: product_id,
      entity_name: productName,
      changes: { quantity, unit_price: selling_price, total },
      performed_by: userId,
    });

    return { data, error: null };
  }

  async function getTodayStats() {
    const today = new Date().toISOString().split('T')[0];

    const { data, error: err } = await supabase
      .from('sales')
      .select('quantity, total')
      .gte('sold_at', today);

    if (err) return { totalSales: 0, totalRevenue: 0, error: err };

    const totalSales = (data || []).reduce((sum, s) => sum + s.quantity, 0);
    const totalRevenue = (data || []).reduce((sum, s) => sum + Number(s.total), 0);

    return { totalSales, totalRevenue, error: null };
  }

  return {
    sales,
    loading,
    error,
    hasMore,
    fetchSales,
    loadMore,
    logSale,
    getTodayStats,
  };
}
