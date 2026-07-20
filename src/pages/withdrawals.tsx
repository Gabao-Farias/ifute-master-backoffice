import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import {
  AlertTriangle,
  ArrowDownToLine,
  CheckCircle2,
  KeyRound,
  Loader2,
  ShieldAlert,
} from 'lucide-react';

import {
  configApi,
  configKeys,
  PIX_KEY_TYPE_OPTIONS,
  type PixKeyType,
} from '@/api/config';
import {
  platformWithdrawalApi,
  platformWithdrawalKeys,
  type PlatformWithdrawalRow,
  type WithdrawalStatus,
} from '@/api/platform-withdrawal';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { brlFromCents } from '@/lib/format';

const errorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    return (
      (error.response?.data as { message?: string } | undefined)?.message ??
      'Não foi possível concluir a operação. Tente novamente.'
    );
  }
  return 'Não foi possível concluir a operação. Tente novamente.';
};

const STATUS_LABEL: Record<WithdrawalStatus, string> = {
  processing: 'Processando',
  dispatched: 'Enviado',
  failed: 'Falhou',
};

const STATUS_CLASS: Record<WithdrawalStatus, string> = {
  processing: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  dispatched: 'bg-primary/15 text-primary',
  failed: 'bg-destructive/15 text-destructive',
};

export default function WithdrawalsPage() {
  const queryClient = useQueryClient();

  const balance = useQuery({
    queryKey: platformWithdrawalKeys.balance(),
    queryFn: platformWithdrawalApi.balance,
  });
  const history = useQuery({
    queryKey: platformWithdrawalKeys.history(),
    queryFn: platformWithdrawalApi.history,
  });
  const pixKey = useQuery({
    queryKey: configKeys.platformPixKey(),
    queryFn: configApi.platformPixKey,
  });

  const forbidden = [balance.error, history.error, pixKey.error].some(
    (e) => isAxiosError(e) && e.response?.status === 403,
  );

  if (forbidden) {
    return (
      <Card className="mx-auto max-w-md">
        <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
          <ShieldAlert className="size-10 text-destructive" />
          <h2 className="text-lg font-semibold">Acesso restrito</h2>
          <p className="text-sm text-muted-foreground">
            Este painel é exclusivo da diretoria do iFute. Sua conta não está
            autorizada.
          </p>
        </CardContent>
      </Card>
    );
  }

  const hasPixKey = Boolean(pixKey.data?.platform_pix_key);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Saque da plataforma
        </h1>
        <p className="text-sm text-muted-foreground">
          Saldo que é de fato da iFute (margem líquida das ordens já fora da
          janela de cancelamento). Não inclui o que ainda é de donos de quadra
          ou padrinhos.
        </p>
      </div>

      <BalanceCard
        loading={balance.isPending}
        error={balance.isError}
        available={balance.data?.available_cents ?? 0}
        fee={balance.data?.fee_cents ?? 0}
        withdrawn={balance.data?.withdrawn_cents ?? 0}
        hasPixKey={hasPixKey}
        onWithdrawn={() => {
          void queryClient.invalidateQueries({
            queryKey: platformWithdrawalKeys.all,
          });
        }}
      />

      <PixKeyCard
        loading={pixKey.isPending}
        currentKey={pixKey.data?.platform_pix_key ?? null}
        currentType={pixKey.data?.platform_pix_key_type ?? null}
      />

      <HistoryCard
        loading={history.isPending}
        error={history.isError}
        items={history.data ?? []}
      />
    </div>
  );
}

function BalanceCard(props: {
  loading: boolean;
  error: boolean;
  available: number;
  fee: number;
  withdrawn: number;
  hasPixKey: boolean;
  onWithdrawn: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  const mutation = useMutation({
    mutationFn: platformWithdrawalApi.requestWithdrawal,
    onSuccess: () => {
      setConfirming(false);
      props.onWithdrawn();
    },
  });

  const net = Math.max(props.available - props.fee, 0);
  const canWithdraw = props.hasPixKey && props.available > props.fee;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saldo disponível</CardTitle>
        <CardDescription>
          Valor sacável agora, já descontando saques em andamento.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {props.error ? (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="size-4" />
            Não foi possível carregar o saldo.
          </div>
        ) : props.loading ? (
          <Skeleton className="h-10 w-48" />
        ) : (
          <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
            <div>
              <div className="text-3xl font-semibold tracking-tight">
                {brlFromCents(props.available)}
              </div>
              <div className="text-xs text-muted-foreground">disponível</div>
            </div>
            <div>
              <div className="text-lg font-medium">
                {brlFromCents(props.fee)}
              </div>
              <div className="text-xs text-muted-foreground">taxa de saque</div>
            </div>
            <div>
              <div className="text-lg font-medium text-primary">
                {brlFromCents(net)}
              </div>
              <div className="text-xs text-muted-foreground">você receberá</div>
            </div>
            <div>
              <div className="text-lg font-medium">
                {brlFromCents(props.withdrawn)}
              </div>
              <div className="text-xs text-muted-foreground">já sacado</div>
            </div>
          </div>
        )}

        {!props.loading && !props.error && !props.hasPixKey && (
          <div className="flex items-center gap-2 rounded-md bg-amber-500/10 p-3 text-sm text-amber-600 dark:text-amber-400">
            <KeyRound className="size-4 shrink-0" />
            Cadastre a chave PIX da plataforma abaixo antes de sacar.
          </div>
        )}

        {mutation.isError && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="size-4 shrink-0" />
            {errorMessage(mutation.error)}
          </div>
        )}

        {mutation.isSuccess && (
          <div className="flex items-center gap-2 text-sm text-primary">
            <CheckCircle2 className="size-4 shrink-0" />
            Saque enviado! O valor cairá na chave PIX cadastrada em instantes.
          </div>
        )}

        {confirming ? (
          <div className="flex flex-wrap items-center gap-3 rounded-md border border-input p-3">
            <span className="text-sm">
              Sacar <strong>{brlFromCents(props.available)}</strong> (líquido{' '}
              <strong>{brlFromCents(net)}</strong>)?
            </span>
            <div className="ml-auto flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirming(false)}
                disabled={mutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending}
              >
                {mutation.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Confirmar saque
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => {
              mutation.reset();
              setConfirming(true);
            }}
            disabled={!canWithdraw || props.loading}
          >
            <ArrowDownToLine className="size-4" />
            Sacar saldo
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function PixKeyCard(props: {
  loading: boolean;
  currentKey: string | null;
  currentType: PixKeyType | null;
}) {
  const queryClient = useQueryClient();
  const [key, setKey] = useState('');
  const [type, setType] = useState<PixKeyType | ''>('');

  // Prefill the type from the saved value once it loads (the raw key is
  // intentionally not prefilled — the input is for entering a new one).
  useEffect(() => {
    if (props.currentType) setType(props.currentType);
  }, [props.currentType]);

  const mutation = useMutation({
    mutationFn: () =>
      configApi.setPlatformPixKey({
        platform_pix_key: key.trim(),
        platform_pix_key_type: type as PixKeyType,
      }),
    onSuccess: () => {
      setKey('');
      void queryClient.invalidateQueries({
        queryKey: configKeys.platformPixKey(),
      });
    },
  });

  const canSave = key.trim().length > 0 && type !== '' && !mutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chave PIX da plataforma</CardTitle>
        <CardDescription>
          Destino de todo saque da plataforma. Separada das chaves dos donos de
          quadra e padrinhos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {props.loading ? (
          <Skeleton className="h-5 w-64" />
        ) : props.currentKey ? (
          <div className="text-sm">
            Chave atual:{' '}
            <span className="font-medium">{props.currentKey}</span>{' '}
            <span className="text-muted-foreground">
              ({props.currentType})
            </span>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Nenhuma chave cadastrada.
          </div>
        )}

        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1 space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              {props.currentKey ? 'Nova chave PIX' : 'Chave PIX'}
            </label>
            <Input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="chave PIX de destino"
            />
          </div>
          <div className="w-44 space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Tipo
            </label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as PixKeyType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo da chave" />
              </SelectTrigger>
              <SelectContent>
                {PIX_KEY_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            onClick={() => mutation.mutate()}
            disabled={!canSave}
          >
            {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
            Salvar chave
          </Button>
        </div>

        {mutation.isError && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="size-4 shrink-0" />
            {errorMessage(mutation.error)}
          </div>
        )}
        {mutation.isSuccess && (
          <div className="flex items-center gap-2 text-sm text-primary">
            <CheckCircle2 className="size-4 shrink-0" />
            Chave PIX atualizada.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function HistoryCard(props: {
  loading: boolean;
  error: boolean;
  items: PlatformWithdrawalRow[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de saques</CardTitle>
      </CardHeader>
      <CardContent>
        {props.error ? (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="size-4" />
            Não foi possível carregar o histórico.
          </div>
        ) : props.loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : props.items.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Nenhum saque realizado ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Data</th>
                  <th className="py-2 pr-4 font-medium">Bruto</th>
                  <th className="py-2 pr-4 font-medium">Taxa</th>
                  <th className="py-2 pr-4 font-medium">Líquido</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {props.items.map((w) => (
                  <tr key={w.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">
                      {new Date(w.created_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-2 pr-4">{brlFromCents(w.gross_cents)}</td>
                    <td className="py-2 pr-4">{brlFromCents(w.fee_cents)}</td>
                    <td className="py-2 pr-4">{brlFromCents(w.net_cents)}</td>
                    <td className="py-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[w.status]}`}
                      >
                        {STATUS_LABEL[w.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
