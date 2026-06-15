const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const inrFormatterPrecise = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const fmtMoney = (v: string | number, { precise = false }: { precise?: boolean } = {}) => {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  if (!Number.isFinite(n)) return '—';
  return precise ? inrFormatterPrecise.format(n) : inrFormatter.format(n);
};

export const fmtCompact = (v: number) => {
  if (!Number.isFinite(v)) return '—';
  if (v >= 1_00_00_000) return `₹${(v / 1_00_00_000).toFixed(1)}Cr`;
  if (v >= 1_00_000) return `₹${(v / 1_00_000).toFixed(1)}L`;
  if (v >= 1_000) return `₹${(v / 1_000).toFixed(1)}k`;
  return `₹${Math.round(v)}`;
};

export const fmtDateTime = (s: string) =>
  new Date(s).toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

export const fmtDayShort = (d: Date) =>
  d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
