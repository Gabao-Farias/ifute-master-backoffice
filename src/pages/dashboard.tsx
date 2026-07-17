import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

import { directorApi, directorKeys } from '@/api/director';
import { KpiCards } from '@/components/dashboard/kpi-cards';
import { MonthlyRevenue } from '@/components/dashboard/monthly-revenue';
import { PlacesRanking } from '@/components/dashboard/places-ranking';
import { Card, CardContent } from '@/components/ui/card';
import type { MetricKey } from '@/lib/metrics';

const MONTHS_WINDOW = 12;
const RANKING_LIMIT = 10;

export default function DashboardPage() {
  const [metric, setMetric] = useState<MetricKey>('gmv');
  const [rankingMonth, setRankingMonth] = useState<string | undefined>();

  const monthly = useQuery({
    queryKey: directorKeys.monthly(MONTHS_WINDOW),
    queryFn: () => directorApi.monthlyRevenue(MONTHS_WINDOW),
  });

  const ranking = useQuery({
    queryKey: directorKeys.ranking(metric, rankingMonth, RANKING_LIMIT),
    queryFn: () =>
      directorApi.placesRanking({
        limit: RANKING_LIMIT,
        sort: metric,
        month: rankingMonth,
      }),
  });

  // 403 = admin logado mas fora da allowlist de diretoria.
  const forbidden =
    (isAxiosError(monthly.error) && monthly.error.response?.status === 403) ||
    (isAxiosError(ranking.error) && ranking.error.response?.status === 403);

  if (forbidden) {
    return (
      <Card className="mx-auto max-w-md">
        <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
          <ShieldAlert className="size-10 text-destructive" />
          <h2 className="text-lg font-semibold">Acesso restrito</h2>
          <p className="text-sm text-muted-foreground">
            Este painel é exclusivo da diretoria do iFute. Sua conta não está
            autorizada. Fale com o time se acredita que isso é um engano.
          </p>
        </CardContent>
      </Card>
    );
  }

  const genericError = monthly.isError || ranking.isError;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Visão geral</h1>
        <p className="text-sm text-muted-foreground">
          Faturamento consolidado de toda a plataforma.
        </p>
      </div>

      {genericError && (
        <Card className="border-destructive/40">
          <CardContent className="flex items-center gap-3 p-4 text-sm text-destructive">
            <AlertTriangle className="size-5 shrink-0" />
            Não foi possível carregar os dados. Tente atualizar a página.
          </CardContent>
        </Card>
      )}

      <KpiCards data={monthly.data} loading={monthly.isPending} />

      <MonthlyRevenue
        data={monthly.data}
        loading={monthly.isPending}
        metric={metric}
        onMetricChange={setMetric}
      />

      <PlacesRanking
        data={ranking.data}
        loading={ranking.isPending}
        sort={metric}
        monthOptions={(monthly.data ?? []).map((row) => row.month)}
        month={rankingMonth}
        onMonthChange={setRankingMonth}
      />
    </div>
  );
}
