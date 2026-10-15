import { useState, useEffect } from 'react';
import styles from './SearchBar.module.css';

export default function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  const [local, setLocal] = useState(value || '');

  useEffect(() => {
    setLocal(value || '');
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (local !== value) onChange(local);
    }, 300);
    return () => clearTimeout(timer);
  }, [local]);

  return (
    <div className={styles.wrapper}>
      <span className={styles.icon}>&#x1F50D;</span>
      <input
        type="text"
        className={styles.input}
        placeholder={placeholder}
        value={local}
        onChange={e => setLocal(e.target.value)}
      />
      {local && (
        <button
          className={styles.clear}
          onClick={() => { setLocal(''); onChange(''); }}
          aria-label="Clear search"
        >
          &#x2715;
        </button>
      )}
    </div>
  );
}
