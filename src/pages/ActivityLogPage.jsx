import { useState, useEffect, useCallback } from 'react';
import { useActivityLog } from '../hooks/useActivityLog';
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';
import { supabase } from '../supabaseClient';
import { formatRelativeTime, formatDate, formatActivityDescription } from '../utils/formatters';
import { ACTION_LABELS } from '../utils/constants';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import EmptyState from '../components/ui/EmptyState';
import { PageSpinner } from '../components/ui/Spinner';
import styles from './ActivityLogPage.module.css';

const actionOptions = Object.entries(ACTION_LABELS).map(([value, label]) => ({ value, label }));
const entityOptions = [
  { value: 'product', label: 'Product' },
  { value: 'category', label: 'Category' },
];

export default function ActivityLogPage() {
  const { activities, loading, hasMore, fetchActivities, loadMore, setActivities } = useActivityLog();
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    action: '',
    entityType: '',
    userId: '',
  });

  useEffect(() => {
    fetchActivities(filters, true);
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('profiles').select('id, display_name');
      if (data) setUsers(data);
    })();
  }, []);

  useRealtimeSubscription('activity_log', {
    onInsert: useCallback(() => {
      fetchActivities(filters, true);
    }, [filters]),
  });

  function handleFilterChange(e) {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function applyFilters() {
    fetchActivities(filters, true);
  }

  function clearFilters() {
    const cleared = { startDate: '', endDate: '', action: '', entityType: '', userId: '' };
    setFilters(cleared);
    fetchActivities(cleared, true);
  }

  const userOptions = users.map(u => ({ value: u.id, label: u.display_name }));

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Activity Log</h1>

      <div className={styles.filters}>
        <Input
          label="From"
          name="startDate"
          type="date"
          value={filters.startDate}
          onChange={handleFilterChange}
        />
        <Input
          label="To"
          name="endDate"
          type="date"
          value={filters.endDate}
          onChange={handleFilterChange}
        />
        <Select
          label="Action"
          name="action"
          options={actionOptions}
          placeholder="All Actions"
          value={filters.action}
          onChange={handleFilterChange}
        />
        <Select
          label="Type"
          name="entityType"
          options={entityOptions}
          placeholder="All Types"
          value={filters.entityType}
          onChange={handleFilterChange}
        />
        <Select
          label="User"
          name="userId"
          options={userOptions}
          placeholder="All Users"
          value={filters.userId}
          onChange={handleFilterChange}
        />
        <div className={styles.filterActions}>
          <Button size="sm" onClick={applyFilters}>Apply</Button>
          <Button size="sm" variant="secondary" onClick={clearFilters}>Clear</Button>
        </div>
      </div>

      {loading && activities.length === 0 ? (
        <PageSpinner />
      ) : activities.length === 0 ? (
        <EmptyState
          icon="&#x1F4CB;"
          title="No activity found"
          message="Try adjusting your filters or wait for some actions to be performed."
        />
      ) : (
        <>
          <div className={styles.list}>
            {activities.map(a => (
                <div key={a.id} className={styles.item}>
                  <div className={styles.avatar}>
                    {a.profiles?.display_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className={styles.content}>
                    <p className={styles.action}>
                      {formatActivityDescription(a)}
                    </p>
                    <time className={styles.time} title={formatDate(a.performed_at)}>
                      {formatRelativeTime(a.performed_at)}
                    </time>
                  </div>
                </div>
              ))}
          </div>
          {hasMore && (
            <div className={styles.loadMore}>
              <Button variant="secondary" onClick={() => loadMore(filters)} disabled={loading}>
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
