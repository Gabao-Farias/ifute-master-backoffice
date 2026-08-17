export const ROUTES = {
  login: '/login',
  dashboard: '/dashboard',
  recents: '/dashboard/recents',
  withdrawals: '/dashboard/withdrawals',
  demand: '/dashboard/demand',
} as const;

/** Links do menu principal (renderizados no header). */
export const NAV_ITEMS = [
  { to: ROUTES.dashboard, label: 'Visão geral' },
  { to: ROUTES.recents, label: 'Cadastros recentes' },
  { to: ROUTES.demand, label: 'Demanda' },
  { to: ROUTES.withdrawals, label: 'Saque' },
] as const;
