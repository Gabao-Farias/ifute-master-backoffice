import { useQuery } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

import { accountHealthApi, accountHealthKeys } from '@/api/account-health';
import { ROUTES } from '@/config/navigation';
import {
  inactivityHeadline,
  inactivityTone,
  isInactivityAlert,
} from '@/lib/account-health';
import { cn } from '@/lib/utils';

/**
 * Faixa de aviso da conta Asaas, renderizada em todas as páginas (Task 34).
 *
 * Fica **invisível enquanto está tudo bem** — só aparece quando a conta entra
 * na reta final dos 180 dias sem movimentação. Um banner permanente viraria
 * paisagem e deixaria de ser lido exatamente quando passasse a importar.
 *
 * Erro (inclusive o 403 de quem não é diretor) não renderiza nada: a própria
 * página já trata acesso e falha.
 */
export function InactivityCallout() {
  const { data } = useQuery({
    queryKey: accountHealthKeys.all,
    queryFn: accountHealthApi.get,
    // A resposta é medida em dias e o backend já cacheia a leitura do extrato.
    staleTime: 30 * 60 * 1000,
    retry: false,
  });

  if (!isInactivityAlert(data) || !data) return null;

  const tone = inactivityTone(data);

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-2 gap-y-1 border-b px-4 py-2.5 text-sm sm:px-6 lg:px-8',
        tone === 'destructive'
          ? 'border-destructive/30 bg-destructive/10 text-destructive'
          : 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
      )}
    >
      <AlertTriangle className="size-4 shrink-0" />
      <span className="font-medium">{inactivityHeadline(data)}</span>
      <Link
        to={ROUTES.withdrawals}
        className="underline underline-offset-4 hover:no-underline"
      >
        Ver detalhes
      </Link>
    </div>
  );
}
