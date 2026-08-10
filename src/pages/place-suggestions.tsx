import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { AlertTriangle, Lightbulb, MapPin, ShieldAlert } from 'lucide-react';

import {
  PLACE_SUGGESTION_STATUSES,
  SOURCE_LABELS,
  STATUS_LABELS,
  placeSuggestionsApi,
  placeSuggestionsKeys,
  type PlaceSuggestion,
  type PlaceSuggestionStatus,
} from '@/api/place-suggestions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { dateTime } from '@/lib/format';

const LIMIT = 50;

type Filter = PlaceSuggestionStatus | 'all';

/**
 * Task 31 — fila de prospecção.
 *
 * As indicações vêm do empty state do app: quando a busca não acha quadra
 * nenhuma perto do usuário, ele indica um local que conhece. Esta tela existe
 * para o dado não morrer no banco — é onde a diretoria vê onde há demanda sem
 * oferta e decide o que prospectar.
 */
export default function PlaceSuggestionsPage() {
  const [filter, setFilter] = useState<Filter>('pending');

  const query = useQuery({
    queryKey: placeSuggestionsKeys.list(filter, LIMIT),
    queryFn: () =>
      placeSuggestionsApi.list(
        filter === 'all' ? undefined : filter,
        LIMIT,
      ),
  });

  const forbidden =
    isAxiosError(query.error) && query.error.response?.status === 403;

  if (forbidden) {
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

  const counts = query.data?.counts;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Locais indicados
        </h1>
        <p className="text-sm text-muted-foreground">
          Quadras que usuários do app indicaram ao não encontrar nada perto
          deles. Cada linha é demanda sem oferta na região.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip
          active={filter === 'all'}
          onClick={() => setFilter('all')}
          label="Todas"
          count={
            counts
              ? Object.values(counts).reduce((sum, n) => sum + n, 0)
              : undefined
          }
        />
        {PLACE_SUGGESTION_STATUSES.map((status) => (
          <FilterChip
            key={status}
            active={filter === status}
            onClick={() => setFilter(status)}
            label={STATUS_LABELS[status]}
            count={counts?.[status]}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="size-4 text-muted-foreground" />
            Fila de prospecção
          </CardTitle>
          <CardDescription>
            Últimas {LIMIT} indicações, da mais recente para a mais antiga.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SuggestionsTable
            isPending={query.isPending}
            isError={query.isError && !forbidden}
            suggestions={query.data?.suggestions ?? []}
            filter={filter}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function FilterChip(props: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={
        props.active
          ? 'rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground'
          : 'rounded-full border border-input px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      }
    >
      {props.label}
      {props.count === undefined ? '' : ` (${props.count})`}
    </button>
  );
}

function SuggestionsTable(props: {
  isPending: boolean;
  isError: boolean;
  suggestions: PlaceSuggestion[];
  filter: Filter;
}) {
  if (props.isError) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <AlertTriangle className="size-4" />
        Não foi possível carregar as indicações.
      </div>
    );
  }

  if (props.isPending) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!props.suggestions.length) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhuma indicação
        {props.filter === 'all' ? '' : ` com status "${STATUS_LABELS[props.filter]}"`}
        .
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="py-2 pr-4 font-medium">Local</th>
            <th className="py-2 pr-4 font-medium">Contato do dono</th>
            <th className="py-2 pr-4 font-medium">Quem indicou</th>
            <th className="py-2 pr-4 font-medium">Origem</th>
            <th className="py-2 pr-4 font-medium">Recebida em</th>
            <th className="py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {props.suggestions.map((s) => (
            <SuggestionRow key={s.suggestion_id} suggestion={s} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SuggestionRow({ suggestion }: { suggestion: PlaceSuggestion }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (status: PlaceSuggestionStatus) =>
      placeSuggestionsApi.updateStatus(suggestion.suggestion_id, status),
    onSuccess: () => {
      // Invalida a chave raiz: mudar o status altera as contagens de todos os
      // filtros, não só do recorte visível.
      void queryClient.invalidateQueries({
        queryKey: placeSuggestionsKeys.all,
      });
    },
  });

  // A coordenada é do dispositivo de quem indicou, não do local — serve para
  // saber a região, e o link do mapa é a forma mais rápida de conferir isso.
  const mapsUrl = useMemo(() => {
    if (suggestion.lat === null || suggestion.lon === null) return null;
    return `https://www.google.com/maps/search/?api=1&query=${suggestion.lat},${suggestion.lon}`;
  }, [suggestion.lat, suggestion.lon]);

  const reporter =
    suggestion.reporter_name ??
    suggestion.reporter_email ??
    suggestion.reporter_contact;

  return (
    <tr className="border-b last:border-0 hover:bg-muted/40">
      <td className="py-2.5 pr-4">
        <div className="font-medium">{suggestion.place_name}</div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {suggestion.city ?? 'cidade não informada'}
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-0.5 text-primary hover:underline"
            >
              <MapPin className="size-3" />
              mapa
            </a>
          )}
        </div>
      </td>
      <td className="py-2.5 pr-4 text-muted-foreground">
        {suggestion.owner_contact ?? '—'}
      </td>
      <td className="py-2.5 pr-4 text-muted-foreground">
        {reporter ?? (
          <span className="text-xs italic">anônimo, sem contato</span>
        )}
      </td>
      <td className="py-2.5 pr-4 text-muted-foreground">
        {SOURCE_LABELS[suggestion.source] ?? suggestion.source}
      </td>
      <td className="py-2.5 pr-4 tabular-nums text-muted-foreground">
        {dateTime(suggestion.created_at)}
      </td>
      <td className="py-2.5">
        <div className="flex flex-wrap items-center gap-1">
          {PLACE_SUGGESTION_STATUSES.map((status) => (
            <Button
              key={status}
              size="sm"
              variant={suggestion.status === status ? 'default' : 'outline'}
              disabled={mutation.isPending || suggestion.status === status}
              onClick={() => mutation.mutate(status)}
            >
              {STATUS_LABELS[status]}
            </Button>
          ))}
        </div>
      </td>
    </tr>
  );
}
