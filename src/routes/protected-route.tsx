import { Navigate } from 'react-router-dom';

import { ROUTES } from '@/config/navigation';
import { useAuthStore } from '@/store/auth-store';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);

  if (!token) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return <>{children}</>;
}
