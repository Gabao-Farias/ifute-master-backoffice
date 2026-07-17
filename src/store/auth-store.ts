import { create } from 'zustand';

const ACCESS_TOKEN_KEY = 'ACCESS_TOKEN';

type AuthState = {
  /** Token de acesso. `undefined` = ainda não verificado; `null` = sem sessão. */
  token: string | null | undefined;
  setToken: (token: string) => void;
  clear: () => void;
};

/**
 * Estado de autenticação. O token é a fonte de verdade tanto em memória quanto
 * em localStorage (o interceptor do axios lê o token direto do storage).
 * Sem escopo de local: o backoffice mestre é global.
 */
export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem(ACCESS_TOKEN_KEY) ?? undefined,
  setToken: (token) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    set({ token });
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    set({ token: null });
  },
}));

export const authStorageKeys = {
  ACCESS_TOKEN: ACCESS_TOKEN_KEY,
} as const;
