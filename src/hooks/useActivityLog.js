import { useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { ACTIVITY_PAGE_SIZE } from '../utils/constants';

export function useActivityLog() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const fetchActivities = useCallback(async (filters = {}, reset = true) => {
    setLoading(true);
    const currentOffset = reset ? 0 : offset;

    let query = supabase
      .from('activity_log')
      .select('*, profiles(display_name)')
      .order('performed_at', { ascending: false })
      .range(currentOffset, currentOffset + ACTIVITY_PAGE_SIZE - 1);

    if (filters.startDate) {
      query = query.gte('performed_at', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('performed_at', filters.endDate + 'T23:59:59');
    }
    if (filters.action) {
      query = query.eq('action', filters.action);
    }
    if (filters.entityType) {
      query = query.eq('entity_type', filters.entityType);
    }
    if (filters.userId) {
      query = query.eq('performed_by', filters.userId);
    }

    const { data, error: err } = await query;

    if (err) {
      setError(err.message);
    } else {
      if (reset) {
        setActivities(data || []);
        setOffset(ACTIVITY_PAGE_SIZE);
      } else {
        setActivities(prev => [...prev, ...(data || [])]);
        setOffset(prev => prev + ACTIVITY_PAGE_SIZE);
      }
      setHasMore((data || []).length === ACTIVITY_PAGE_SIZE);
      setError(null);
    }
    setLoading(false);
  }, [offset]);

  const loadMore = useCallback((filters) => {
    fetchActivities(filters, false);
  }, [fetchActivities]);

  return {
    activities,
    loading,
    error,
    hasMore,
    fetchActivities,
    loadMore,
    setActivities,
  };
}
