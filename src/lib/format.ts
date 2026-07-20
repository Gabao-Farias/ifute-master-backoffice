/** Centavos inteiros → string em BRL (R$). */
export const brlFromCents = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

/** Centavos → BRL compacto (ex.: "R$ 12,3 mil") — para eixos de gráfico. */
export const brlCompactFromCents = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1,
  });

/** ISO string → data e hora local "20/07/2026, 14:32". */
export const dateTime = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

/** `YYYY-MM` → rótulo curto "jul/25". */
export const monthLabel = (yearMonth: string) => {
  const [year, month] = yearMonth.split('-').map(Number);
  if (!year || !month) return yearMonth;
  const date = new Date(year, month - 1, 1);
  const name = date.toLocaleDateString('pt-BR', { month: 'short' });
  return `${name.replace('.', '')}/${String(year).slice(2)}`;
};

/** `YYYY-MM` → rótulo longo "Julho de 2025". */
export const monthLabelLong = (yearMonth: string) => {
  const [year, month] = yearMonth.split('-').map(Number);
  if (!year || !month) return yearMonth;
  const date = new Date(year, month - 1, 1);
  const label = date.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
};
