import styles from './StatsCard.module.css';

export default function StatsCard({ icon, label, value, variant = 'default' }) {
  return (
    <div className={`${styles.card} ${styles[variant]}`}>
      <span className={styles.icon}>{icon}</span>
      <div>
        <p className={styles.value}>{value}</p>
        <p className={styles.label}>{label}</p>
      </div>
    </div>
  );
}
