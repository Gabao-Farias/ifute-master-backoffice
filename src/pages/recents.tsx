import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { AlertTriangle, MapPin, ShieldAlert, Users } from 'lucide-react';

import {
  recentsApi,
  recentsKeys,
  type RecentAdmin,
  type RecentPlace,
  type RecentUser,
} from '@/api/recents';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { dateTime } from '@/lib/format';

const LIMIT = 20;

/** Iniciais para o fallback do avatar. */
const initials = (name: string | null, email: string) => {
  const base = (name ?? email).trim();
  const parts = base.split(/\s+/).filter(Boolean);
  const chars = parts.length >= 2 ? parts[0][0] + parts[1][0] : base.slice(0, 2);
  return chars.toUpperCase();
};

export default function RecentsPage() {
  const users = useQuery({
    queryKey: recentsKeys.users(LIMIT),
    queryFn: () => recentsApi.users(LIMIT),
  });
  const admins = useQuery({
    queryKey: recentsKeys.admins(LIMIT),
    queryFn: () => recentsApi.admins(LIMIT),
  });
  const places = useQuery({
    queryKey: recentsKeys.places(LIMIT),
    queryFn: () => recentsApi.places(LIMIT),
  });

  // 403 = admin logado mas fora da allowlist de diretoria.
  const forbidden = [users.error, admins.error, places.error].some(
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Cadastros recentes
        </h1>
        <p className="text-sm text-muted-foreground">
          Últimos {LIMIT} registros de cada tipo, do mais recente para o mais
          antigo.
        </p>
      </div>

      <RecentSection
        title="Usuários do app"
        description="Jogadores que criaram conta no aplicativo."
        icon={<Users className="size-4 text-muted-foreground" />}
        query={users}
        emptyLabel="Nenhum usuário encontrado."
        columns={['Usuário', 'E-mail', 'Criado em']}
        renderRow={(u: RecentUser) => (
          <tr key={u.user_id} className="border-b last:border-0 hover:bg-muted/40">
            <td className="py-2.5 pr-4">
              <Person name={u.name} email={u.email} image={u.image} />
            </td>
            <td className="py-2.5 pr-4 text-muted-foreground">{u.email}</td>
            <td className="py-2.5 tabular-nums text-muted-foreground">
              {dateTime(u.created_at)}
            </td>
          </tr>
        )}
      />

      <RecentSection
        title="Administradores"
        description="Donos de quadra que se cadastraram no backoffice."
        icon={<ShieldAlert className="size-4 text-muted-foreground" />}
        query={admins}
        emptyLabel="Nenhum administrador encontrado."
        columns={['Administrador', 'E-mail', 'Origem', 'Criado em']}
        renderRow={(a: RecentAdmin) => (
          <tr
            key={a.admin_id}
            className="border-b last:border-0 hover:bg-muted/40"
          >
            <td className="py-2.5 pr-4">
              <Person name={a.name} email={a.email} image={a.image} />
            </td>
            <td className="py-2.5 pr-4 text-muted-foreground">{a.email}</td>
            <td className="py-2.5 pr-4">
              {a.referred_by_admin_id ? (
                <span className="inline-flex rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                  Afiliado
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">Direto</span>
              )}
            </td>
            <td className="py-2.5 tabular-nums text-muted-foreground">
              {dateTime(a.created_at)}
            </td>
          </tr>
        )}
      />

      <RecentSection
        title="Locais"
        description="Complexos esportivos criados na plataforma."
        icon={<MapPin className="size-4 text-muted-foreground" />}
        query={places}
        emptyLabel="Nenhum local encontrado."
        columns={['Local', 'Cidade', 'Dono', 'Criado em']}
        renderRow={(p: RecentPlace) => (
          <tr
            key={p.place_id}
            className="border-b last:border-0 hover:bg-muted/40"
          >
            <td className="py-2.5 pr-4">
              <Person name={p.name} email={p.place_id} image={p.brand_image} />
            </td>
            <td className="py-2.5 pr-4 text-muted-foreground">
              {[p.city, p.state].filter(Boolean).join(' / ') || '—'}
            </td>
            <td className="py-2.5 pr-4 text-muted-foreground">
              {p.owner_name ?? '—'}
            </td>
            <td className="py-2.5 tabular-nums text-muted-foreground">
              {dateTime(p.created_at)}
            </td>
          </tr>
        )}
      />
    </div>
  );
}

/** Avatar + nome em uma célula. Reaproveitado pelas três tabelas. */
function Person(props: {
  name: string | null;
  email: string;
  image: string | null;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Avatar className="size-8">
        {props.image && <AvatarImage src={props.image} alt="" />}
        <AvatarFallback className="text-xs">
          {initials(props.name, props.email)}
        </AvatarFallback>
      </Avatar>
      <span className="max-w-[16rem] truncate font-medium">
        {props.name ?? '—'}
      </span>
    </div>
  );
}

type RecentSectionProps<T> = {
  title: string;
  description: string;
  icon: React.ReactNode;
  query: UseQueryResult<T[]>;
  columns: string[];
  emptyLabel: string;
  renderRow: (item: T) => React.ReactNode;
};

function RecentSection<T>({
  title,
  description,
  icon,
  query,
  columns,
  emptyLabel,
  renderRow,
}: RecentSectionProps<T>) {
  const { data, isPending, isError } = query;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isError ? (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="size-4" />
            Não foi possível carregar os dados.
          </div>
        ) : isPending ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !data?.length ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {emptyLabel}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  {columns.map((c) => (
                    <th key={c} className="py-2 pr-4 font-medium">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>{data.map(renderRow)}</tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
