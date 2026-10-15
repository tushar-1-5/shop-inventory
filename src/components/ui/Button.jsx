import styles from './Button.module.css';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  onClick,
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonGroup({ children, className = '' }) {
  return (
    <div className={`${styles.buttonGroup} ${className}`}>
      {children}
    </div>
  );
}
