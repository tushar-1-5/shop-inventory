import { useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useRealtimeSubscription(table, { onInsert, onUpdate, onDelete }) {
  useEffect(() => {
    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table },
        (payload) => onInsert?.(payload.new)
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table },
        (payload) => onUpdate?.(payload.new, payload.old)
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table },
        (payload) => onDelete?.(payload.old)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table]);
}
