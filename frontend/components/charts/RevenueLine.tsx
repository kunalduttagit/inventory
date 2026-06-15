'use client';

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fmtCompact, fmtMoney } from '@/lib/format';

export type RevenuePoint = { day: string; revenue: number };

export default function RevenueLine({ data }: { data: RevenuePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2383e2" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#2383e2" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="day"
          tick={{ fill: 'currentColor', fontSize: 11, opacity: 0.55 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={(v: number) => fmtCompact(v)}
          tick={{ fill: 'currentColor', fontSize: 11, opacity: 0.55 }}
          tickLine={false}
          axisLine={false}
          width={48}
        />
        <Tooltip
          cursor={{ stroke: 'currentColor', strokeOpacity: 0.15, strokeWidth: 1 }}
          contentStyle={{
            background: 'rgba(25,25,25,0.92)',
            border: 'none',
            borderRadius: 8,
            color: '#fff',
            fontSize: 12,
            padding: '6px 10px',
          }}
          labelStyle={{ color: '#9b9a96', marginBottom: 2 }}
          formatter={(v: number) => [fmtMoney(v), 'Revenue']}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#2383e2"
          strokeWidth={2}
          fill="url(#revfill)"
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
