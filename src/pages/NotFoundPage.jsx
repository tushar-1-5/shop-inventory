import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  return (
    <div className={styles.page}>
      <span className={styles.code}>404</span>
      <h1 className={styles.title}>Page Not Found</h1>
      <p className={styles.message}>The page you are looking for does not exist.</p>
      <Link to="/">
        <Button>Go to Dashboard</Button>
      </Link>
    </div>
  );
}
