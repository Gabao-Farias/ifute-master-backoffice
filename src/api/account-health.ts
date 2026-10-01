import { api } from './client';

// VITE_API_URL já inclui o prefixo /director; aqui só os caminhos internos.
const ACCOUNT_HEALTH_URL = '/private/account-health';

/**
 * `unknown` = não foi possível consultar o Asaas agora (a rota responde 200
 * mesmo assim, para que uma instabilidade do gateway não derrube a tela).
 */
export type AccountHealthStatus =
  | 'ok'
  | 'warning'
  | 'critical'
  | 'inactive'
  | 'unknown';

export type AccountHealth = {
  status: AccountHealthStatus;
  checked_at: string;
  /** Null quando não houve movimentação dentro da janela consultada. */
  last_movement_at?: string | null;
  last_movement_description?: string | null;
  days_since_last_movement?: number | null;
  days_until_inactive?: number;
  scanned_since?: string;
  balance_cents?: number;
  /** O Asaas só cobra a taxa enquanto houver saldo na conta. */
  fee_applicable?: boolean;
  monthly_fee_cents?: number;
  inactivity_window_days?: number;
};

export const accountHealthApi = {
  async get(): Promise<AccountHealth> {
    const { data } = await api.get<AccountHealth>(ACCOUNT_HEALTH_URL);
    return data;
  },
};

export const accountHealthKeys = {
  all: ['account-health'] as const,
};
