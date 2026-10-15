import styles from './Input.module.css';

export default function Select({
  label,
  error,
  options = [],
  placeholder = 'Select...',
  id,
  className = '',
  ...props
}) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`${styles.field} ${className}`}>
      {label && <label htmlFor={selectId} className={styles.label}>{label}</label>}
      <select
        id={selectId}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
