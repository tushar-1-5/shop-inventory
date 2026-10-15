import styles from './Spinner.module.css';

export default function Spinner({ size = 24 }) {
  return (
    <div
      className={styles.spinner}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageSpinner() {
  return (
    <div className={styles.page}>
      <Spinner size={40} />
    </div>
  );
}
