import { useContext } from 'react';
import { ToastContext } from '../../contexts/ToastContext';
import styles from './Toast.module.css';

export default function ToastContainer() {
  const { toasts, removeToast } = useContext(ToastContext);

  return (
    <div className={styles.container}>
      {toasts.map(toast => (
        <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
          <span>{toast.message}</span>
          <button className={styles.dismiss} onClick={() => removeToast(toast.id)}>
            &#x2715;
          </button>
        </div>
      ))}
    </div>
  );
}
