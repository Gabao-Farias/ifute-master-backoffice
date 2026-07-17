# ifute-master-backoffice

Backoffice **mestre** da iFute — painel global e de acesso total, exclusivo para
a **diretoria**. Diferente do `ifute-backoffice` (escopado por local), aqui a
visão é da plataforma inteira. Task 23 (plano em `../tasks/task23-planning.md`).

## Stack

React 19 + Vite + TypeScript + TailwindCSS v4 + shadcn/ui + TanStack Query +
Zustand + Recharts. Login via Google OAuth (mesmo fluxo do backoffice).

## Funcionalidades

- **Faturamento por mês** (últimos 12 meses) com 3 métricas:
  - **GMV** — total pago pelos usuários.
  - **Receita iFute** — a taxa da plataforma por bloco.
  - **Margem líquida** — receita − comissão de afiliados. (O custo Asaas
    `provider_fee` é mostrado à parte; não entra na margem.)
- **Ranking dos 10 locais** com maior faturamento, ordenável por métrica e
  filtrável por mês.
- Cards de KPI do mês corrente com variação mês-a-mês.

## Rodando localmente (contra produção)

```bash
cp .env.sample .env       # preencha VITE_GOOGLE_AUTH_CLIENT_ID
npm install
npm run dev               # http://localhost:7104
```

Por padrão o `.env.sample` aponta para a API de produção
(`https://api.ifute.com.br/director`). Para um backend local, use
`VITE_API_URL=http://localhost:7100/director`.

> O backend expõe um **app dedicado** `backoffice-director` (montado em
> `/director`), separado do app `backoffice`. Ele tem CORS próprio liberando
> `http://localhost:7104` — por isso este painel roda em localhost contra prod.

> A origem `http://localhost:7104` precisa estar autorizada no client OAuth do
> Google Cloud usado.

## Acesso (allowlist de diretoria)

O acesso é controlado no **backend** (`ifute-core-simple`, app `backoffice-director`)
pela env `DIRECTOR_ADMIN_IDS` (lista de `admin_id` separada por vírgula). Um admin
logado que não esteja na lista recebe `403` nas rotas `/director/private/*` e vê a
tela "Acesso restrito". Para liberar um diretor:

1. O diretor faz login uma vez (cria o `AdminUser`).
2. Pegue o `admin_id` dele e adicione a `DIRECTOR_ADMIN_IDS` no `.env` do backend.
3. Rele o core (`ifute-compose/scripts/release.sh ifute-core-simple`).

## Endpoints consumidos

- `POST /director/public/auth/login/google`
- `GET  /director/private/auth/login/check`
- `GET  /director/private/reports/revenue/monthly?months=12`
- `GET  /director/private/reports/places/ranking?limit=10&sort=<metric>&month=YYYY-MM`

## Scripts

| Comando | O quê |
|---|---|
| `npm run dev` | Vite dev server na porta 7104 |
| `npm run build` | `tsc -b && vite build` → `dist/` |
| `npm run preview` | Serve o build na porta 7104 |
