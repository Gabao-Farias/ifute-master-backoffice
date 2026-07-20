import { api } from './client';

// VITE_API_URL já inclui o prefixo /director; aqui só os caminhos internos.
const WITHDRAWAL_URL = '/private/withdrawal';

export type WithdrawalStatus = 'processing' | 'dispatched' | 'failed';

/** Saldo da plataforma disponível para saque (centavos). */
export type PlatformBalance = {
  available_cents: number;
  fee_cents: number;
  withdrawn_cents: number;
};

export type PlatformWithdrawalRow = {
  id: string;
  gross_cents: number;
  fee_cents: number;
  net_cents: number;
  status: WithdrawalStatus;
  created_at: string;
  dispatched_at: string | null;
};

export type PlatformWithdrawalResult = {
  id: string;
  gross_cents: number;
  fee_cents: number;
  net_cents: number;
  status: WithdrawalStatus;
};

export const platformWithdrawalApi = {
  /** Saldo, taxa vigente e total já sacado. */
  async balance(): Promise<PlatformBalance> {
    const { data } = await api.get<PlatformBalance>(`${WITHDRAWAL_URL}/balance`);
    return data;
  },

  /** Saca o saldo total disponível da plataforma. */
  async requestWithdrawal(): Promise<PlatformWithdrawalResult> {
    const { data } = await api.post<PlatformWithdrawalResult>(WITHDRAWAL_URL);
    return data;
  },

  /** Histórico de saques (mais recente primeiro). */
  async history(): Promise<PlatformWithdrawalRow[]> {
    const { data } = await api.get<{ items: PlatformWithdrawalRow[] }>(
      `${WITHDRAWAL_URL}/history`,
    );
    return data.items;
  },
};

export const platformWithdrawalKeys = {
  all: ['platform-withdrawal'] as const,
  balance: () => ['platform-withdrawal', 'balance'] as const,
  history: () => ['platform-withdrawal', 'history'] as const,
};
