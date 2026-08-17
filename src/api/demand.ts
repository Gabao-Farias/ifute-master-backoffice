import { api } from './client';

// VITE_API_URL já inclui o prefixo /director.
const REPORTS_URL = '/private/reports';

/**
 * Um ponto do mapa de demanda: uma coordenada arredondada a ~1 km, com o que
 * aconteceu ali na janela.
 *
 * O número que importa é `empty_searches` — busca que devolveu tela vazia, ou
 * seja, demanda que existe e não foi atendida. `searches` sozinho não distingue
 * "achou quadra" de "não achou nada".
 */
export type DemandPoint = {
  lat: number;
  lon: number;
  /** Rótulo humano resolvido no backend (offline, sem reverse geocoding). */
  label: string;
  /** Coordenada convencionada de teste em prod — tráfego interno, não demanda. */
  is_test: boolean;
  in_brazil: boolean;
  searches: number;
  empty_searches: number;
  suggestions: number;
  signups: number;
  distinct_users: number;
  first_seen: string;
  last_seen: string;
};

export type DemandTotals = {
  searches: number;
  empty_searches: number;
  suggestions: number;
  user_signups: number;
  user_logins: number;
  orders_created: number;
  orders_paid: number;
  orders_canceled: number;
};

/** Indicação de quadra enviada pela tela vazia do app. */
export type DemandSuggestion = {
  occurred_at: string;
  place_name: string;
  contact: string | null;
  lat: number | null;
  lon: number | null;
  label: string | null;
};

export type DemandReport = {
  window_days: number;
  since: string;
  totals: DemandTotals;
  points: DemandPoint[];
  suggestions: DemandSuggestion[];
};

export const demandApi = {
  /** Mapa de demanda da janela (default 30 dias, teto 365). */
  async report(days = 30): Promise<DemandReport> {
    const { data } = await api.get<DemandReport>(`${REPORTS_URL}/demand`, {
      params: { days },
    });
    return data;
  },
};

export const demandKeys = {
  all: ['demand'] as const,
  report: (days: number) => ['demand', 'report', days] as const,
};
