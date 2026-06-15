'use client';

import { motion } from 'framer-motion';
import { fmtMoney } from '@/lib/format';

export type TopProduct = { name: string; revenue: number; units: number };

export default function TopProducts({ data }: { data: TopProduct[] }) {
  if (data.length === 0) {
    return (
      <div className="text-xs text-ink-500 dark:text-night-muted py-6">
        No sales yet — top sellers will appear here.
      </div>
    );
  }
  const max = Math.max(...data.map((d) => d.revenue), 1);
  const colors = ['#2383e2', '#0f9d58', '#d9730d', '#6940a5', '#e03e3e'];

  return (
    <div className="space-y-2.5">
      {data.map((row, i) => {
        const pct = (row.revenue / max) * 100;
        return (
          <div key={row.name}>
            <div className="flex items-baseline justify-between gap-3 text-xs mb-1">
              <span className="truncate text-ink-700 dark:text-night-text">{row.name}</span>
              <span className="tabular-nums text-ink-900 dark:text-night-text font-medium">
                {fmtMoney(row.revenue)}
                <span className="text-ink-500 dark:text-night-muted font-normal"> · {row.units}u</span>
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-ink-300/30 dark:bg-night-border/60 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
                style={{ background: colors[i % colors.length] }}
                className="h-full rounded-full"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
