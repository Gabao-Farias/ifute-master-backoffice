import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CalendarClock, CheckCircle2 } from 'lucide-react';

import { accountHealthApi, accountHealthKeys } from '@/api/account-health';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  INACTIVITY_REMEDY,
  inactivityHeadline,
  inactivityTone,
  isInactivityAlert,
} from '@/lib/account-health';
import { brlFromCents, dateTime } from '@/lib/format';
import { cn } from '@/lib/utils';

/**
 * Detalhe da contagem de inatividade da conta Asaas (Task 34). Vive na página
 * de saque porque é lá que a diretoria já pensa no dinheiro parado no Asaas —
 * e porque o próprio botão de saque acima é uma das formas de zerar a contagem.
 */
export function InactivityCard() {
  const { data, isPending, isError } = useQuery({
    queryKey: accountHealthKeys.all,
    queryFn: accountHealthApi.get,
    staleTime: 30 * 60 * 1000,
    retry: false,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade da conta Asaas</CardTitle>
        <CardDescription>
          O Asaas cobra{' '}
          {data?.monthly_fee_cents
            ? brlFromCents(data.monthly_fee_cents)
            : 'uma taxa mensal'}{' '}
          por mês de contas que passam{' '}
          {data?.inactivity_window_days ?? 180} dias sem movimentação de saldo —
          e só enquanto houver saldo na conta.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isPending ? (
          <Skeleton className="h-10 w-64" />
        ) : isError || data?.status === 'unknown' ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="size-4 shrink-0" />
            Não foi possível consultar o extrato do Asaas agora. Tente atualizar
            a página em alguns minutos.
          </div>
        ) : (
          data && (
            <>
              <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
                <div>
                  <div
                    className={cn(
                      'text-3xl font-semibold tracking-tight',
                      isInactivityAlert(data) &&
                        inactivityTone(data) === 'destructive' &&
                        'text-destructive',
                    )}
                  >
                    {data.days_until_inactive ?? 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    dias até a conta ficar inativa
                  </div>
                </div>
                <div>
                  <div className="text-lg font-medium">
                    {data.last_movement_at
                      ? dateTime(data.last_movement_at)
                      : '—'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {data.last_movement_at
                      ? 'última movimentação'
                      : `sem movimentação desde ${
                          data.scanned_since
                            ? dateTime(data.scanned_since)
                            : 'o início da janela consultada'
                        }`}
                  </div>
                </div>
                <div>
                  <div className="text-lg font-medium">
                    {brlFromCents(data.balance_cents ?? 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    saldo na conta Asaas
                  </div>
                </div>
              </div>

              {isInactivityAlert(data) ? (
                <div
                  className={cn(
                    'space-y-1 rounded-md p-3 text-sm',
                    inactivityTone(data) === 'destructive'
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
                  )}
                >
                  <div className="flex items-center gap-2 font-medium">
                    <CalendarClock className="size-4 shrink-0" />
                    {inactivityHeadline(data)}
                  </div>
                  <p>{INACTIVITY_REMEDY}</p>
                  {!data.fee_applicable && (
                    <p>
                      A conta está sem saldo, então nada é cobrado enquanto
                      seguir assim.
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="size-4 shrink-0 text-primary" />
                  Conta em dia. {INACTIVITY_REMEDY}
                </div>
              )}
            </>
          )
        )}
      </CardContent>
    </Card>
  );
}
