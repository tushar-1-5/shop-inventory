import styles from './QuantityAdjuster.module.css';

export default function QuantityAdjuster({ quantity, onAdjust, disabled }) {
  return (
    <div className={styles.adjuster}>
      <button
        className={styles.btn}
        onClick={() => onAdjust(quantity - 1)}
        disabled={disabled || quantity <= 0}
        aria-label="Decrease quantity"
      >
        &minus;
      </button>
      <span className={styles.value}>{quantity}</span>
      <button
        className={styles.btn}
        onClick={() => onAdjust(quantity + 1)}
        disabled={disabled}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
