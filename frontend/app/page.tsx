'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import { AlertTriangle, IndianRupee, Package, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetcher, type DashboardStats, type Order } from '@/lib/api';
import { fmtCompact, fmtDayShort, fmtMoney } from '@/lib/format';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import RevenueLine, { type RevenuePoint } from '@/components/charts/RevenueLine';
import OrdersBars, { type OrdersPoint } from '@/components/charts/OrdersBars';
import TopProducts, { type TopProduct } from '@/components/charts/TopProducts';

function lastNDays(n: number) {
  const days: { key: string; label: string; date: Date }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    days.push({
      key: d.toISOString().slice(0, 10),
      label: fmtDayShort(d),
      date: d,
    });
  }
  return days;
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useSWR<DashboardStats>('/dashboard', fetcher, {
    refreshInterval: 5000,
  });
  const { data: orders } = useSWR<Order[]>('/orders', fetcher, { refreshInterval: 5000 });

  const totalRevenue = useMemo(() => {
    if (!orders) return 0;
    return orders.reduce((acc, o) => acc + parseFloat(o.total_amount), 0);
  }, [orders]);

  const { revenuePoints, ordersPoints } = useMemo(() => {
    const days = lastNDays(7);
    const revMap = new Map<string, number>();
    const ordMap = new Map<string, number>();
    days.forEach((d) => {
      revMap.set(d.key, 0);
      ordMap.set(d.key, 0);
    });
    (orders ?? []).forEach((o) => {
      const k = o.created_at.slice(0, 10);
      if (revMap.has(k)) revMap.set(k, (revMap.get(k) || 0) + parseFloat(o.total_amount));
      if (ordMap.has(k)) ordMap.set(k, (ordMap.get(k) || 0) + 1);
    });
    const rev: RevenuePoint[] = days.map((d) => ({ day: d.label, revenue: revMap.get(d.key) || 0 }));
    const ord: OrdersPoint[] = days.map((d) => ({ day: d.label, orders: ordMap.get(d.key) || 0 }));
    return { revenuePoints: rev, ordersPoints: ord };
  }, [orders]);

  const topProducts: TopProduct[] = useMemo(() => {
    const map = new Map<number, TopProduct>();
    (orders ?? []).forEach((o) => {
      o.items.forEach((it) => {
        const name = it.product?.name ?? `Product #${it.product_id}`;
        const cur = map.get(it.product_id) ?? { name, revenue: 0, units: 0 };
        cur.revenue += parseFloat(it.unit_price) * it.quantity;
        cur.units += it.quantity;
        map.set(it.product_id, cur);
      });
    });
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [orders]);

  const cards = [
    { label: 'Revenue', value: fmtCompact(totalRevenue), icon: IndianRupee, color: 'text-accent-blue' },
    { label: 'Products', value: stats?.total_products ?? '…', icon: Package, color: 'text-accent-orange' },
    { label: 'Customers', value: stats?.total_customers ?? '…', icon: Users, color: 'text-accent-purple' },
    { label: 'Orders', value: stats?.total_orders ?? '…', icon: ShoppingCart, color: 'text-accent-green' },
  ];

  return (
    <div className="px-5 md:px-10 py-8 md:py-10 max-w-6xl mx-auto">
      <PageHeader
        title="Dashboard"
        description="An overview of your inventory at a glance."
        icon={TrendingUp}
        iconColor="text-accent-blue"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
              whileHover={{ y: -2 }}
              className="rounded-xl border border-ink-300/40 dark:border-night-border bg-white/60 dark:bg-night-surface p-4 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-ink-500 dark:text-night-muted">{c.label}</span>
                <Icon className={`w-4 h-4 ${c.color}`} strokeWidth={2} />
              </div>
              <div className="text-2xl font-semibold text-ink-900 dark:text-night-text tabular-nums">
                {isLoading && c.value === '…' ? '…' : c.value}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-6">
        <Card className="lg:col-span-2 p-5" delay={0.08}>
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-ink-900 dark:text-night-text">Revenue</h2>
              <p className="text-xs text-ink-500 dark:text-night-muted">Last 7 days</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-ink-900 dark:text-night-text tabular-nums">
                {fmtMoney(totalRevenue)}
              </div>
              <div className="text-[11px] text-ink-500 dark:text-night-muted">all-time</div>
            </div>
          </div>
          <div className="text-ink-500 dark:text-night-muted">
            <RevenueLine data={revenuePoints} />
          </div>
        </Card>

        <Card className="p-5" delay={0.12}>
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-ink-900 dark:text-night-text">Orders</h2>
              <p className="text-xs text-ink-500 dark:text-night-muted">Last 7 days</p>
            </div>
            <div className="text-lg font-semibold text-ink-900 dark:text-night-text tabular-nums">
              {ordersPoints.reduce((a, b) => a + b.orders, 0)}
            </div>
          </div>
          <div className="text-ink-500 dark:text-night-muted">
            <OrdersBars data={ordersPoints} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6">
        <Card className="p-5" delay={0.16}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-accent-green" />
            <h2 className="text-sm font-semibold text-ink-900 dark:text-night-text">Top products</h2>
            <span className="text-xs text-ink-500 dark:text-night-muted">by revenue</span>
          </div>
          <TopProducts data={topProducts} />
        </Card>

        <Card className="p-5" delay={0.2}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-accent-red" />
            <h2 className="text-sm font-semibold text-ink-900 dark:text-night-text">Low stock</h2>
            <span className="text-xs text-ink-500 dark:text-night-muted">below 10 in stock</span>
          </div>
          {stats && stats.low_stock_products.length === 0 ? (
            <p className="text-xs text-ink-500 dark:text-night-muted py-2">All products are well-stocked.</p>
          ) : (
            <div className="divide-y divide-ink-300/30 dark:divide-night-border">
              {stats?.low_stock_products.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <div className="text-sm text-ink-900 dark:text-night-text truncate">{p.name}</div>
                    <div className="text-[11px] text-ink-500 dark:text-night-muted font-mono truncate">
                      SKU {p.sku}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-accent-red tabular-nums shrink-0 ml-3">
                    {p.quantity} left
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
