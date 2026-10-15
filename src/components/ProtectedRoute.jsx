import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { PageSpinner } from './ui/Spinner';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <PageSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
