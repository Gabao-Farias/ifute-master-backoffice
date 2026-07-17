import type { PlaceRankingRow } from '@/api/director';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { brlFromCents, monthLabelLong } from '@/lib/format';
import { METRICS, type MetricKey } from '@/lib/metrics';
import { cn } from '@/lib/utils';

const ALL_MONTHS = 'all';

type PlacesRankingProps = {
  data?: PlaceRankingRow[];
  loading?: boolean;
  sort: MetricKey;
  monthOptions: string[];
  month?: string;
  onMonthChange: (month: string | undefined) => void;
};

export function PlacesRanking({
  data,
  loading,
  sort,
  monthOptions,
  month,
  onMonthChange,
}: PlacesRankingProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle>Top 10 locais por faturamento</CardTitle>
          <CardDescription>
            Ordenado por {METRICS.find((m) => m.key === sort)?.label} ·{' '}
            {month ? monthLabelLong(month) : 'todo o período'}
          </CardDescription>
        </div>
        <Select
          value={month ?? ALL_MONTHS}
          onValueChange={(v) =>
            onMonthChange(v === ALL_MONTHS ? undefined : v)
          }
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_MONTHS}>Todo o período</SelectItem>
            {[...monthOptions].reverse().map((m) => (
              <SelectItem key={m} value={m}>
                {monthLabelLong(m)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !data?.length ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Nenhum faturamento no período selecionado.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="w-10 py-2 pr-2 font-medium">#</th>
                  <th className="py-2 pr-4 font-medium">Local</th>
                  {METRICS.map((m) => (
                    <th
                      key={m.key}
                      className={cn(
                        'py-2 pl-4 text-right font-medium',
                        m.key === sort && 'text-primary',
                      )}
                    >
                      {m.short}
                    </th>
                  ))}
                  <th className="py-2 pl-4 text-right font-medium">Pedidos</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr
                    key={row.place_id}
                    className="border-b last:border-0 hover:bg-muted/40"
                  >
                    <td className="py-2.5 pr-2 tabular-nums text-muted-foreground">
                      {index + 1}
                    </td>
                    <td className="max-w-[16rem] truncate py-2.5 pr-4 font-medium">
                      {row.place_name ?? row.place_id}
                    </td>
                    {METRICS.map((m) => (
                      <td
                        key={m.key}
                        className={cn(
                          'py-2.5 pl-4 text-right tabular-nums',
                          m.key === sort
                            ? 'font-semibold text-primary'
                            : 'text-muted-foreground',
                        )}
                      >
                        {brlFromCents(row[m.field] as number)}
                      </td>
                    ))}
                    <td className="py-2.5 pl-4 text-right tabular-nums text-muted-foreground">
                      {row.order_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
