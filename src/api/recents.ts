import { api } from './client';

// Rotas do app backoffice-director. VITE_API_URL já inclui o prefixo /director,
// então aqui ficam só os caminhos internos.
const RECENTS_URL = '/private/recents';

export type RecentUser = {
  user_id: string;
  name: string | null;
  email: string;
  image: string | null;
  created_at: string;
};

export type RecentAdmin = {
  admin_id: string;
  name: string | null;
  email: string;
  image: string | null;
  referred_by_admin_id: string | null;
  created_at: string;
};

export type RecentPlace = {
  place_id: string;
  name: string;
  brand_image: string | null;
  city: string | null;
  state: string | null;
  owner_name: string | null;
  created_at: string;
};

export const recentsApi = {
  /** Últimos usuários do app criados (exclui deletados). */
  async users(limit = 20): Promise<RecentUser[]> {
    const { data } = await api.get<RecentUser[]>(`${RECENTS_URL}/users`, {
      params: { limit },
    });
    return data;
  },

  /** Últimos administradores (donos de quadra) criados. */
  async admins(limit = 20): Promise<RecentAdmin[]> {
    const { data } = await api.get<RecentAdmin[]>(`${RECENTS_URL}/admins`, {
      params: { limit },
    });
    return data;
  },

  /** Últimos locais criados. */
  async places(limit = 20): Promise<RecentPlace[]> {
    const { data } = await api.get<RecentPlace[]>(`${RECENTS_URL}/places`, {
      params: { limit },
    });
    return data;
  },
};

export const recentsKeys = {
  all: ['recents'] as const,
  users: (limit: number) => ['recents', 'users', limit] as const,
  admins: (limit: number) => ['recents', 'admins', limit] as const,
  places: (limit: number) => ['recents', 'places', limit] as const,
};
