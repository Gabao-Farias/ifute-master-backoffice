export const ROUTES = {
  login: '/login',
  dashboard: '/dashboard',
  withdrawals: '/dashboard/withdrawals',
} as const;

/** Links do menu principal (renderizados no header). */
export const NAV_ITEMS = [
  { to: ROUTES.dashboard, label: 'Visão geral' },
  { to: ROUTES.withdrawals, label: 'Saque' },
] as const;
