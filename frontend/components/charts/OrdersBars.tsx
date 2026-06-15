'use client';

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export type OrdersPoint = { day: string; orders: number };

export default function OrdersBars({ data }: { data: OrdersPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barCategoryGap="30%">
        <XAxis
          dataKey="day"
          tick={{ fill: 'currentColor', fontSize: 11, opacity: 0.55 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: 'currentColor', fontSize: 11, opacity: 0.55 }}
          tickLine={false}
          axisLine={false}
          width={24}
        />
        <Tooltip
          cursor={{ fill: 'currentColor', fillOpacity: 0.05 }}
          contentStyle={{
            background: 'rgba(25,25,25,0.92)',
            border: 'none',
            borderRadius: 8,
            color: '#fff',
            fontSize: 12,
            padding: '6px 10px',
          }}
          labelStyle={{ color: '#9b9a96', marginBottom: 2 }}
          formatter={(v: number) => [v, 'Orders']}
        />
        <Bar dataKey="orders" fill="#0f9d58" radius={[6, 6, 2, 2]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
