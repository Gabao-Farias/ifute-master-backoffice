import { QueryClient } from '@tanstack/react-query';

/**
 * Instância única do QueryClient — fica fora do React para poder ser limpa
 * também em código não-React (interceptor de 401 do axios) e no logout.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 60_000,
    },
  },
});
