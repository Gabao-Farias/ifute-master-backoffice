export const ROUTES = {
  login: '/login',
  dashboard: '/dashboard',
  recents: '/dashboard/recents',
  placeSuggestions: '/dashboard/place-suggestions',
  withdrawals: '/dashboard/withdrawals',
} as const;

/** Links do menu principal (renderizados no header). */
export const NAV_ITEMS = [
  { to: ROUTES.dashboard, label: 'Visão geral' },
  { to: ROUTES.recents, label: 'Cadastros recentes' },
  { to: ROUTES.placeSuggestions, label: 'Locais indicados' },
  { to: ROUTES.withdrawals, label: 'Saque' },
] as const;
