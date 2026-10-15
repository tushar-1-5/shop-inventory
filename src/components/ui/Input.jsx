import styles from './Input.module.css';

export default function Input({
  label,
  error,
  type = 'text',
  id,
  className = '',
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`${styles.field} ${className}`}>
      {label && <label htmlFor={inputId} className={styles.label}>{label}</label>}
      {type === 'textarea' ? (
        <textarea
          id={inputId}
          className={`${styles.input} ${styles.textarea} ${error ? styles.inputError : ''}`}
          {...props}
        />
      ) : (
        <input
          id={inputId}
          type={type}
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          {...props}
        />
      )}
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
