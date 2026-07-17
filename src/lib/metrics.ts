import type { RevenueBucket } from '@/api/director';

export type MetricKey = 'gmv' | 'platform_revenue' | 'net_margin';

export type MetricDef = {
  key: MetricKey;
  /** Coluna correspondente nos buckets da API. */
  field: keyof RevenueBucket;
  label: string;
  short: string;
  description: string;
};

/**
 * As três métricas de faturamento (Task 23). `net_margin` = receita da
 * plataforma − comissão de afiliados; o `provider_fee` (custo Asaas) é
 * mostrado à parte, não entra na margem.
 */
export const METRICS: MetricDef[] = [
  {
    key: 'gmv',
    field: 'gmv_cents',
    label: 'GMV (volume)',
    short: 'GMV',
    description: 'Total pago pelos usuários',
  },
  {
    key: 'platform_revenue',
    field: 'platform_revenue_cents',
    label: 'Receita iFute',
    short: 'Receita',
    description: 'Taxa da plataforma por bloco',
  },
  {
    key: 'net_margin',
    field: 'net_margin_cents',
    label: 'Margem líquida',
    short: 'Margem',
    description: 'Receita − comissão de afiliados',
  },
];

export const metricByKey = (key: MetricKey): MetricDef =>
  METRICS.find((m) => m.key === key) ?? METRICS[0];
