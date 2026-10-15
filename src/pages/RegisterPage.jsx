import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validateAuth, hasErrors } from '../utils/validators';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import styles from './AuthPage.module.css';

export default function RegisterPage() {
  const { user, signUp, loading } = useAuth();
  const [form, setForm] = useState({
    display_name: '',
    email: '',
    password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    setServerError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validation = validateAuth(form, true);
    if (hasErrors(validation)) {
      setErrors(validation);
      return;
    }

    setSubmitting(true);
    const { data, error } = await signUp(form.email, form.password, form.display_name);
    setSubmitting(false);

    if (error) {
      setServerError(error.message);
    } else if (data?.user && !data.session) {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.header}>
            <span className={styles.logo}>&#x2709;</span>
            <h1 className={styles.title}>Check your email</h1>
            <p className={styles.subtitle}>
              We sent a confirmation link to <strong>{form.email}</strong>.
              Click the link to activate your account.
            </p>
          </div>
          <p className={styles.footer}>
            <Link to="/login">Back to Sign In</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.logo}>&#x1F4E6;</span>
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>Join your team&apos;s inventory</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {serverError && <div className={styles.serverError}>{serverError}</div>}

          <Input
            label="Display Name"
            name="display_name"
            value={form.display_name}
            onChange={handleChange}
            error={errors.display_name}
            autoComplete="name"
          />

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
            autoComplete="new-password"
          />

          <Input
            label="Confirm Password"
            type="password"
            name="confirm_password"
            value={form.confirm_password}
            onChange={handleChange}
            error={errors.confirm_password}
            autoComplete="new-password"
          />

          <Button type="submit" disabled={submitting} className={styles.submit}>
            {submitting ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <p className={styles.footer}>
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
