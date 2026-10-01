import type { AccountHealth } from '@/api/account-health';

/**
 * Gravidade visual do aviso de inatividade.
 *
 * `fee_applicable` rebaixa o tom de propósito: o Asaas só cobra a taxa
 * enquanto a conta tem saldo, então uma conta parada e zerada não custa nada —
 * pintar isso de vermelho treinaria a diretoria a ignorar o aviso justamente
 * para quando ele importar.
 */
export type InactivityTone = 'destructive' | 'amber';

export const isInactivityAlert = (health: AccountHealth | undefined): boolean =>
  !!health && health.status !== 'ok' && health.status !== 'unknown';

export const inactivityTone = (health: AccountHealth): InactivityTone =>
  (health.status === 'critical' || health.status === 'inactive') &&
  health.fee_applicable
    ? 'destructive'
    : 'amber';

/** Frase curta de topo — o que está acontecendo, em uma linha. */
export const inactivityHeadline = (health: AccountHealth): string => {
  const days = health.days_until_inactive ?? 0;

  if (health.status === 'inactive') {
    return health.fee_applicable
      ? 'A conta Asaas está inativa e sujeita à taxa mensal.'
      : 'A conta Asaas está inativa (sem saldo, nada é cobrado por enquanto).';
  }

  return `Faltam ${days} ${days === 1 ? 'dia' : 'dias'} para a conta Asaas ser considerada inativa.`;
};

/** Como a conta volta a ser ativa — o que a diretoria precisa fazer. */
export const INACTIVITY_REMEDY =
  'Qualquer movimentação de saldo zera a contagem: receber uma cobrança, fazer um saque ou uma transferência pelo painel do Asaas.';
