import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { MonthlyRevenueRow } from '@/api/director';
import { MetricToggle } from '@/components/dashboard/metric-toggle';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  brlCompactFromCents,
  brlFromCents,
  monthLabel,
  monthLabelLong,
} from '@/lib/format';
import { metricByKey, type MetricKey } from '@/lib/metrics';

type MonthlyRevenueProps = {
  data?: MonthlyRevenueRow[];
  loading?: boolean;
  metric: MetricKey;
  onMetricChange: (metric: MetricKey) => void;
};

type ChartTooltipProps = {
  active?: boolean;
  payload?: { payload: { monthKey: string; value: number } }[];
};

function ChartTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{monthLabelLong(point.monthKey)}</p>
      <p className="tabular-nums text-primary">{brlFromCents(point.value)}</p>
    </div>
  );
}

export function MonthlyRevenue({
  data,
  loading,
  metric,
  onMetricChange,
}: MonthlyRevenueProps) {
  const def = metricByKey(metric);

  const chartData = (data ?? []).map((row) => ({
    monthKey: row.month,
    label: monthLabel(row.month),
    value: (row[def.field] as number) ?? 0,
  }));

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle>Faturamento por mês</CardTitle>
          <CardDescription>
            {def.label} — {def.description}
          </CardDescription>
        </div>
        <MetricToggle value={metric} onChange={onMetricChange} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[320px] w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                tickFormatter={(v: number) => brlCompactFromCents(v)}
                tickLine={false}
                axisLine={false}
                width={72}
                fontSize={12}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: 'hsl(var(--primary) / 0.1)' }}
              />
              <Bar
                dataKey="value"
                fill="hsl(var(--primary))"
                radius={[6, 6, 0, 0]}
                maxBarSize={56}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
