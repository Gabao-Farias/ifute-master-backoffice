import axios from 'axios';

import { ENV } from '@/lib/env';
import { queryClient } from '@/lib/query-client';
import { authStorageKeys, useAuthStore } from '@/store/auth-store';

const UNAUTHORIZED_STATUS_CODE = 401;

export const api = axios.create({
  baseURL: ENV.API_URL,
});

// Request: anexa o bearer token. (Sem header `active-place-id` — o backoffice
// mestre é global, não escopado por local.)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(authStorageKeys.ACCESS_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: 401 derruba a sessão (o ProtectedRoute redireciona ao login).
// 403 (não é diretor) NÃO derruba — a tela mostra "acesso restrito".
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === UNAUTHORIZED_STATUS_CODE) {
      useAuthStore.getState().clear();
      queryClient.clear();
    }
    return Promise.reject(error);
  },
);
