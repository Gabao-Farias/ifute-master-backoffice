import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ROUTES } from '@/config/navigation';
import { ProtectedRoute } from './protected-route';

const LoginPage = lazy(() => import('@/pages/login'));
const DashboardPage = lazy(() => import('@/pages/dashboard'));
const RecentsPage = lazy(() => import('@/pages/recents'));
const PlaceSuggestionsPage = lazy(() => import('@/pages/place-suggestions'));
const WithdrawalsPage = lazy(() => import('@/pages/withdrawals'));

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}

const lazyEl = (node: React.ReactNode) => (
  <Suspense fallback={<PageFallback />}>{node}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: ROUTES.login,
    element: lazyEl(<LoginPage />),
  },
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: ROUTES.dashboard, element: lazyEl(<DashboardPage />) },
      { path: ROUTES.recents, element: lazyEl(<RecentsPage />) },
      {
        path: ROUTES.placeSuggestions,
        element: lazyEl(<PlaceSuggestionsPage />),
      },
      { path: ROUTES.withdrawals, element: lazyEl(<WithdrawalsPage />) },
    ],
  },
  {
    path: '*',
    element: <Navigate to={ROUTES.login} replace />,
  },
]);
