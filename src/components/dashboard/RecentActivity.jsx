import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import { useRealtimeSubscription } from '../../hooks/useRealtimeSubscription';
import { formatRelativeTime } from '../../utils/formatters';
import { ACTION_LABELS } from '../../utils/constants';
import styles from './RecentActivity.module.css';

export default function RecentActivity() {
  const [activities, setActivities] = useState([]);

  const fetchRecent = useCallback(async () => {
    const { data } = await supabase
      .from('activity_log')
      .select('*, profiles(display_name)')
      .order('performed_at', { ascending: false })
      .limit(8);
    if (data) setActivities(data);
  }, []);

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  useRealtimeSubscription('activity_log', {
    onInsert: useCallback(() => {
      fetchRecent();
    }, [fetchRecent]),
  });

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Recent Activity</h3>
      {activities.length === 0 ? (
        <p className={styles.empty}>No activity yet</p>
      ) : (
        <ul className={styles.list}>
          {activities.map(a => (
            <li key={a.id} className={styles.item}>
              <div className={styles.avatar}>
                {a.profiles?.display_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className={styles.content}>
                <p className={styles.description}>
                  <strong>{a.profiles?.display_name || 'Unknown'}</strong>
                  {' '}{ACTION_LABELS[a.action]?.toLowerCase() || a.action}
                  {' '}<span className={styles.entity}>{a.entity_name}</span>
                </p>
                <time className={styles.time} title={a.performed_at}>
                  {formatRelativeTime(a.performed_at)}
                </time>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
