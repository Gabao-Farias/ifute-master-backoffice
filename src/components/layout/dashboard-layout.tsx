import { Outlet } from 'react-router-dom';

import { InactivityCallout } from '@/components/account-health/inactivity-callout';

import { Header } from './header';

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <InactivityCallout />
      <main className="mx-auto w-full max-w-6xl flex-1 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
