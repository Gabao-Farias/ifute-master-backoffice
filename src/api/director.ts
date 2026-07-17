import { api } from './client';

// Rotas do app backoffice-director. VITE_API_URL já inclui o prefixo /director,
// então aqui ficam só os caminhos internos.
const REPORTS_URL = '/private/reports';

/** Métricas agregadas (centavos), compartilhadas por mês e por local. */
export type RevenueBucket = {
  gmv_cents: number;
  platform_revenue_cents: number;
  net_margin_cents: number;
  provider_fee_cents: number;
  order_count: number;
};

export type MonthlyRevenueRow = { month: string } & RevenueBucket;

export type PlaceRankingRow = {
  place_id: string;
  place_name: string | null;
} & RevenueBucket;

export type RankSort = 'gmv' | 'platform_revenue' | 'net_margin';

export const directorApi = {
  /** Série de faturamento por mês (mais antigo primeiro). */
  async monthlyRevenue(months = 12): Promise<MonthlyRevenueRow[]> {
    const { data } = await api.get<MonthlyRevenueRow[]>(
      `${REPORTS_URL}/revenue/monthly`,
      { params: { months } },
    );
    return data;
  },

  /** Ranking de locais por faturamento. */
  async placesRanking(params: {
    limit?: number;
    sort?: RankSort;
    month?: string;
  }): Promise<PlaceRankingRow[]> {
    const { data } = await api.get<PlaceRankingRow[]>(
      `${REPORTS_URL}/places/ranking`,
      { params },
    );
    return data;
  },
};

export const directorKeys = {
  all: ['director'] as const,
  monthly: (months: number) => ['director', 'monthly', months] as const,
  ranking: (sort: RankSort, month: string | undefined, limit: number) =>
    ['director', 'ranking', sort, month ?? 'all', limit] as const,
};
