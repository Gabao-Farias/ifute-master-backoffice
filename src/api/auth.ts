import { api } from './client';

const PUBLIC_AUTH_URL = '/public/auth';
const PRIVATE_AUTH_URL = '/private/auth';

export type GoogleLoginBody = {
  /** Fluxo implícito do GIS (botão custom): token de acesso do Google. */
  access_token?: string;
  idToken?: string;
};

export type LoginResponse = {
  accessToken: string;
};

export const authApi = {
  /** Troca o token do Google por um accessToken da iFute. */
  async loginGoogle(body: GoogleLoginBody): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>(
      `${PUBLIC_AUTH_URL}/login/google`,
      body,
    );
    return data;
  },

  /** Valida o token atual (só header, sem payload). */
  async checkAuth(): Promise<void> {
    await api.get(`${PRIVATE_AUTH_URL}/login/check`);
  },
};
