import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import {
  ExternalLink,
  Lightbulb,
  MapPin,
  SearchX,
  ShieldAlert,
} from 'lucide-react';

import {
  demandApi,
  demandKeys,
  type DemandPoint,
  type DemandSuggestion,
} from '@/api/demand';
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
import { dateTime } from '@/lib/format';

const WINDOW_OPTIONS = [7, 30, 90, 365] as const;

const mapsUrl = (lat: number, lon: number) =>
  `https://www.google.com/maps?q=${lat},${lon}`;

/** Percentual de buscas que devolveram tela vazia. */
const emptyRate = (empty: number, total: number) =>
  total > 0 ? `${Math.round((empty / total) * 100)}%` : '—';

function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
        {hint ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default function DemandPage() {
  const [days, setDays] = useState<number>(30);

  const report = useQuery({
    queryKey: demandKeys.report(days),
    queryFn: () => demandApi.report(days),
  });

  if (isAxiosError(report.error) && report.error.response?.status === 403) {
    return (
      <Card className="mx-auto max-w-md">
        <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
          <ShieldAlert className="size-10 text-destructive" />
          <h2 className="text-lg font-semibold">Acesso restrito</h2>
          <p className="text-sm text-muted-foreground">
            Este painel é exclusivo da diretoria do iFute. Sua conta não está
            autorizada.
          </p>
        </CardContent>
      </Card>
    );
  }

  const data = report.data;
  const totals = data?.totals;

  // Pontos de teste (Atlântico Sul) são tráfego interno de validação — ficam
  // separados para não inflarem o mapa de prospecção.
  const realPoints = (data?.points ?? []).filter((p) => !p.is_test);
  const testPoints = (data?.points ?? []).filter((p) => p.is_test);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Mapa de demanda
          </h1>
          <p className="text-sm text-muted-foreground">
            Onde procuraram quadra e o que encontraram. Coordenadas com precisão
            de ~1 km.
          </p>
        </div>

        <Select
          value={String(days)}
          onValueChange={(value) => setDays(Number(value))}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WINDOW_OPTIONS.map((option) => (
              <SelectItem key={option} value={String(option)}>
                Últimos {option} dias
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {report.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label="Buscas"
            value={totals?.searches ?? 0}
            hint={`${totals?.empty_searches ?? 0} sem resultado`}
          />
          <StatTile
            label="Buscas vazias"
            value={emptyRate(totals?.empty_searches ?? 0, totals?.searches ?? 0)}
            hint="demanda não atendida"
          />
          <StatTile
            label="Cadastros"
            value={totals?.user_signups ?? 0}
            hint={`${totals?.user_logins ?? 0} logins de conta existente`}
          />
          <StatTile
            label="Reservas pagas"
            value={totals?.orders_paid ?? 0}
            hint={`${totals?.orders_created ?? 0} criadas · ${
              totals?.orders_canceled ?? 0
            } canceladas`}
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="size-4 text-muted-foreground" />
            Regiões
          </CardTitle>
          <CardDescription>
            Ordenado por volume de busca. &ldquo;Vazias&rdquo; é o que importa:
            gente procurando onde não há oferta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {report.isLoading ? (
            <Skeleton className="h-40" />
          ) : realPoints.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhuma busca geolocalizada nesta janela.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-muted-foreground">
                  <tr className="border-b">
                    <th className="pb-2 pr-4 font-medium">Região</th>
                    <th className="pb-2 pr-4 font-medium">Buscas</th>
                    <th className="pb-2 pr-4 font-medium">Vazias</th>
                    <th className="pb-2 pr-4 font-medium">Indicações</th>
                    <th className="pb-2 pr-4 font-medium">Cadastros</th>
                    <th className="pb-2 pr-4 font-medium">Última</th>
                    <th className="pb-2 font-medium">Mapa</th>
                  </tr>
                </thead>
                <tbody>
                  {realPoints.map((point: DemandPoint) => (
                    <tr
                      key={`${point.lat},${point.lon}`}
                      className="border-b last:border-0 hover:bg-muted/40"
                    >
                      <td className="py-2.5 pr-4">
                        <span className="font-medium">{point.label}</span>
                        {!point.in_brazil ? (
                          <span className="ml-2 inline-flex rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-medium text-destructive">
                            scanner?
                          </span>
                        ) : null}
                        <span className="block text-xs tabular-nums text-muted-foreground">
                          {point.lat}, {point.lon}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 tabular-nums">
                        {point.searches}
                      </td>
                      <td className="py-2.5 pr-4 tabular-nums">
                        {point.empty_searches > 0 ? (
                          <span className="font-medium text-destructive">
                            {point.empty_searches}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-4 tabular-nums">
                        {point.suggestions || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-4 tabular-nums">
                        {point.signups || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-4 tabular-nums text-muted-foreground">
                        {dateTime(point.last_seen)}
                      </td>
                      <td className="py-2.5">
                        <a
                          href={mapsUrl(point.lat, point.lon)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          abrir <ExternalLink className="size-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {testPoints.length > 0 ? (
            <p className="mt-4 text-xs text-muted-foreground">
              {testPoints.reduce((sum, p) => sum + p.searches, 0)} busca(s) nas
              coordenadas de teste (Atlântico Sul) omitidas — tráfego interno de
              validação.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="size-4 text-muted-foreground" />
            Quadras indicadas
          </CardTitle>
          <CardDescription>
            Enviadas pela tela vazia do app. É lista de prospecção: o jogador
            já joga lá e conhece o dono.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {report.isLoading ? (
            <Skeleton className="h-24" />
          ) : (data?.suggestions.length ?? 0) === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <SearchX className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Nenhuma indicação nesta janela.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-muted-foreground">
                  <tr className="border-b">
                    <th className="pb-2 pr-4 font-medium">Quadra</th>
                    <th className="pb-2 pr-4 font-medium">Contato</th>
                    <th className="pb-2 pr-4 font-medium">Região</th>
                    <th className="pb-2 font-medium">Quando</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.suggestions.map(
                    (suggestion: DemandSuggestion, index: number) => (
                      <tr
                        key={`${suggestion.occurred_at}-${index}`}
                        className="border-b last:border-0 hover:bg-muted/40"
                      >
                        <td className="py-2.5 pr-4 font-medium">
                          {suggestion.place_name}
                        </td>
                        <td className="py-2.5 pr-4 text-muted-foreground">
                          {suggestion.contact ?? '—'}
                        </td>
                        <td className="py-2.5 pr-4 text-muted-foreground">
                          {suggestion.label ?? 'sem localização'}
                        </td>
                        <td className="py-2.5 tabular-nums text-muted-foreground">
                          {dateTime(suggestion.occurred_at)}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
