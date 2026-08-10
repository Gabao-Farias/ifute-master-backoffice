import { api } from './client';

// Rotas do app backoffice-director. VITE_API_URL já inclui o prefixo /director.
const PLACE_SUGGESTIONS_URL = '/private/place-suggestions';

/** Estados da fila de prospecção. Espelha `PLACE_SUGGESTION_STATUSES` no core. */
export const PLACE_SUGGESTION_STATUSES = [
  'pending',
  'contacted',
  'converted',
  'discarded',
] as const;

export type PlaceSuggestionStatus = (typeof PLACE_SUGGESTION_STATUSES)[number];

export const STATUS_LABELS: Record<PlaceSuggestionStatus, string> = {
  pending: 'Pendente',
  contacted: 'Contatado',
  converted: 'Convertido',
  discarded: 'Descartado',
};

export const SOURCE_LABELS: Record<string, string> = {
  empty_state_home: 'Início',
  empty_state_search: 'Busca',
};

export type PlaceSuggestion = {
  suggestion_id: string;
  place_name: string;
  city: string | null;
  owner_contact: string | null;
  reporter_contact: string | null;
  /** Nome/e-mail de quem indicou, quando estava logado. Nulos se anônimo. */
  reporter_name: string | null;
  reporter_email: string | null;
  lat: number | null;
  lon: number | null;
  source: string;
  status: string;
  created_at: string;
};

export type PlaceSuggestionsResponse = {
  suggestions: PlaceSuggestion[];
  /** Contagem por status sobre a tabela inteira, não sobre o filtro corrente. */
  counts: Record<string, number>;
};

export const placeSuggestionsApi = {
  /** Fila de prospecção. Sem `status`, devolve tudo. */
  async list(
    status?: PlaceSuggestionStatus,
    limit = 50,
  ): Promise<PlaceSuggestionsResponse> {
    const { data } = await api.get<PlaceSuggestionsResponse>(
      PLACE_SUGGESTIONS_URL,
      { params: { status, limit } },
    );
    return data;
  },

  /** Move a indicação na fila. */
  async updateStatus(suggestionId: string, status: PlaceSuggestionStatus) {
    const { data } = await api.patch<{
      suggestion_id: string;
      status: string;
    }>(`${PLACE_SUGGESTIONS_URL}/${suggestionId}`, { status });
    return data;
  },
};

export const placeSuggestionsKeys = {
  all: ['place-suggestions'] as const,
  list: (status: PlaceSuggestionStatus | 'all', limit: number) =>
    ['place-suggestions', 'list', status, limit] as const,
};
