import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validateAuth, hasErrors } from '../utils/validators';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import styles from './AuthPage.module.css';

export default function LoginPage() {
  const { user, signIn, loading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    setServerError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validation = validateAuth(form);
    if (hasErrors(validation)) {
      setErrors(validation);
      return;
    }

    setSubmitting(true);
    const { error } = await signIn(form.email, form.password);
    setSubmitting(false);

    if (error) {
      setServerError(error.message);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.logo}>&#x1F4E6;</span>
          <h1 className={styles.title}>Shop Inventory</h1>
          <p className={styles.subtitle}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {serverError && <div className={styles.serverError}>{serverError}</div>}

          <Input
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="current-password"
          />

          <Button type="submit" disabled={submitting} className={styles.submit}>
            {submitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className={styles.footer}>
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
