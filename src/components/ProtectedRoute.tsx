import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { FullPageSpinner } from '@/components/ui/Spinner';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageSpinner message="Loading your workspace..." />;
  if (!session) return <Navigate to="/login" state={{ from: location }} replace />;

  return <>{children}</>;
}
