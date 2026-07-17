import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';

import type { MonthlyRevenueRow } from '@/api/director';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { brlFromCents, monthLabelLong } from '@/lib/format';
import { METRICS } from '@/lib/metrics';
import { cn } from '@/lib/utils';

type KpiCardsProps = {
  data?: MonthlyRevenueRow[];
  loading?: boolean;
};

/** Variação percentual mês-a-mês (MoM). `null` quando não há base de comparação. */
const momDelta = (current: number, previous: number): number | null => {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
};

export function KpiCards({ data, loading }: KpiCardsProps) {
  if (loading || !data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {METRICS.map((m) => (
          <Card key={m.key}>
            <CardContent className="p-5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-3 h-8 w-32" />
              <Skeleton className="mt-2 h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const current = data[data.length - 1];
  const previous = data[data.length - 2];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {METRICS.map((metric) => {
        const value = (current?.[metric.field] as number) ?? 0;
        const prev = (previous?.[metric.field] as number) ?? 0;
        const delta = momDelta(value, prev);

        const DeltaIcon =
          delta === null
            ? ArrowRight
            : delta >= 0
              ? ArrowUpRight
              : ArrowDownRight;

        return (
          <Card key={metric.key}>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
                {brlFromCents(value)}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs">
                <span
                  className={cn(
                    'flex items-center gap-0.5 font-medium',
                    delta === null
                      ? 'text-muted-foreground'
                      : delta >= 0
                        ? 'text-success'
                        : 'text-destructive',
                  )}
                >
                  <DeltaIcon className="size-3.5" />
                  {delta === null
                    ? '—'
                    : `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`}
                </span>
                <span className="text-muted-foreground">vs. mês anterior</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
      {current && (
        <p className="col-span-full -mt-1 text-xs text-muted-foreground">
          Mês corrente: {monthLabelLong(current.month)} ·{' '}
          {current.order_count} pedidos · custo Asaas{' '}
          {brlFromCents(current.provider_fee_cents)}
        </p>
      )}
    </div>
  );
}
