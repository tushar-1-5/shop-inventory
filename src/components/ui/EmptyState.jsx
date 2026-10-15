import styles from './EmptyState.module.css';

export default function EmptyState({ icon = '📦', title, message, children }) {
  return (
    <div className={styles.container}>
      <span className={styles.icon}>{icon}</span>
      <h3 className={styles.title}>{title}</h3>
      {message && <p className={styles.message}>{message}</p>}
      {children && <div className={styles.actions}>{children}</div>}
    </div>
  );
}
