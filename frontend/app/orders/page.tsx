'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, fetcher, type Customer, type Order, type Product } from '@/lib/api';
import { fmtDateTime, fmtMoney } from '@/lib/format';
import PageHeader from '@/components/PageHeader';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import EmptyState from '@/components/EmptyState';
import { useConfirm } from '@/hooks/useConfirm';

type Line = { product_id: number | null; quantity: number };

export default function OrdersPage() {
  const { data: orders, isLoading } = useSWR<Order[]>('/orders', fetcher);
  const { data: products } = useSWR<Product[]>('/products', fetcher);
  const { data: customers } = useSWR<Customer[]>('/customers', fetcher);

  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [lines, setLines] = useState<Line[]>([{ product_id: null, quantity: 1 }]);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const { confirm, dialog: confirmDialog } = useConfirm();

  const startCreate = () => {
    setCustomerId(null);
    setLines([{ product_id: null, quantity: 1 }]);
    setOpen(true);
  };

  const projectedTotal = lines.reduce((acc, l) => {
    if (!l.product_id) return acc;
    const p = products?.find((x) => x.id === l.product_id);
    if (!p) return acc;
    return acc + parseFloat(p.price) * (l.quantity || 0);
  }, 0);

  const noProducts = !products || products.length === 0;
  const noCustomers = !customers || customers.length === 0;

  const valid =
    customerId !== null &&
    lines.length > 0 &&
    lines.every((l) => l.product_id !== null && l.quantity > 0);

  const save = async () => {
    if (!valid) return;
    setSaving(true);
    try {
      await api('/orders', {
        method: 'POST',
        body: JSON.stringify({
          customer_id: customerId,
          items: lines.map((l) => ({ product_id: l.product_id, quantity: l.quantity })),
        }),
      });
      toast.success('Order placed');
      mutate('/orders');
      mutate('/products');
      mutate('/dashboard');
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to place order');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (o: Order) => {
    const ok = await confirm({
      title: 'Cancel order',
      message: (
        <>
          Cancel <span className="font-medium text-ink-900 dark:text-night-text">order #{o.id}</span>?
          Stock will be restored.
        </>
      ),
      confirmLabel: 'Cancel order',
      cancelLabel: 'Keep',
    });
    if (!ok) return;
    try {
      await api(`/orders/${o.id}`, { method: 'DELETE' });
      toast.success('Order cancelled');
      mutate('/orders');
      mutate('/products');
      mutate('/dashboard');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Cancel failed');
    }
  };

  return (
    <div className="px-6 md:px-10 py-8 md:py-10 max-w-5xl mx-auto">
      <PageHeader
        title="Orders"
        description="Every order placed by your customers."
        icon={ShoppingCart}
        iconColor="text-accent-green"
        action={
          <Button variant="primary" onClick={startCreate}>
            <Plus className="w-4 h-4" /> New order
          </Button>
        }
      />

      {isLoading && <div className="text-sm text-ink-500 dark:text-night-muted py-8">Loading…</div>}
      {!isLoading && (orders?.length ?? 0) === 0 && (
        <EmptyState
          icon={ShoppingCart}
          title="No orders yet"
          description="Create your first order to start selling."
          action={
            <Button variant="primary" onClick={startCreate}>
              <Plus className="w-4 h-4" /> New order
            </Button>
          }
        />
      )}

      <div className="divide-y divide-ink-300/30 dark:divide-night-border">
        <AnimatePresence initial={false}>
          {orders?.map((o) => {
            const isOpen = expanded === o.id;
            return (
              <motion.div key={o.id} layout className="py-3">
                <div className="flex items-center gap-3 group">
                  <button
                    onClick={() => setExpanded(isOpen ? null : o.id)}
                    className="flex-1 flex items-center gap-3 text-left"
                  >
                    <motion.span animate={{ rotate: isOpen ? 0 : -90 }} transition={{ duration: 0.15 }}>
                      <ChevronDown className="w-4 h-4 text-ink-500 dark:text-night-muted" />
                    </motion.span>
                    <div className="flex-1 flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm text-ink-900 dark:text-night-text">
                          Order <span className="text-ink-500 dark:text-night-muted">#{o.id}</span>
                          <span className="text-ink-500 dark:text-night-muted"> · </span>
                          <span>{o.customer?.full_name ?? 'Unknown customer'}</span>
                        </div>
                        <div className="text-xs text-ink-500 dark:text-night-muted">{fmtDateTime(o.created_at)}</div>
                      </div>
                      <div className="text-sm font-medium text-ink-900 dark:text-night-text tabular-nums">
                        {fmtMoney(o.total_amount)}
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => remove(o)}
                    className="p-1 rounded text-ink-500 dark:text-night-muted hover:bg-accent-red/10 hover:text-accent-red opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Cancel order"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-7 pt-3 pb-1 text-sm">
                        {o.items.map((it) => (
                          <div key={it.id} className="grid grid-cols-12 gap-2 py-1">
                            <div className="col-span-7 text-ink-700 dark:text-night-text truncate">
                              {it.product?.name ?? `Product #${it.product_id}`}
                            </div>
                            <div className="col-span-2 text-ink-500 dark:text-night-muted text-right tabular-nums">
                              × {it.quantity}
                            </div>
                            <div className="col-span-3 text-right tabular-nums text-ink-700 dark:text-night-text">
                              {fmtMoney(it.unit_price)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {confirmDialog}

      <Modal open={open} onClose={() => setOpen(false)} title="New order">
        {(noProducts || noCustomers) ? (
          <p className="text-sm text-ink-500 dark:text-night-muted">
            You need at least one {noCustomers && 'customer'}
            {noCustomers && noProducts && ' and one '}
            {noProducts && 'product'} before placing an order.
          </p>
        ) : (
          <div className="space-y-4">
            <div>
              <span className="block text-xs font-medium text-ink-500 dark:text-night-muted mb-0.5">Customer</span>
              <select
                value={customerId ?? ''}
                onChange={(e) => setCustomerId(e.target.value ? Number(e.target.value) : null)}
                className="notion-input bg-transparent"
              >
                <option value="">Select a customer…</option>
                {customers?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-ink-500 dark:text-night-muted">Items</span>
                <button
                  onClick={() => setLines([...lines, { product_id: null, quantity: 1 }])}
                  className="text-xs text-accent-blue hover:underline"
                >
                  + add another
                </button>
              </div>
              <div className="space-y-2">
                {lines.map((line, idx) => {
                  const p = products?.find((x) => x.id === line.product_id);
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={line.product_id ?? ''}
                        onChange={(e) => {
                          const v = e.target.value ? Number(e.target.value) : null;
                          const next = [...lines];
                          next[idx] = { ...next[idx], product_id: v };
                          setLines(next);
                        }}
                        className="notion-input bg-transparent flex-1"
                      >
                        <option value="">Select a product…</option>
                        {products?.map((prod) => (
                          <option
                            key={prod.id}
                            value={prod.id}
                            disabled={prod.quantity === 0 || lines.some((l, i) => i !== idx && l.product_id === prod.id)}
                          >
                            {prod.name} — {prod.quantity} in stock · {fmtMoney(prod.price)}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        max={p?.quantity ?? undefined}
                        value={line.quantity}
                        onChange={(e) => {
                          const next = [...lines];
                          next[idx] = { ...next[idx], quantity: Math.max(1, Number(e.target.value) || 1) };
                          setLines(next);
                        }}
                        className="notion-input w-20 text-right"
                      />
                      {lines.length > 1 && (
                        <button
                          onClick={() => setLines(lines.filter((_, i) => i !== idx))}
                          className="p-1 text-ink-500 dark:text-night-muted hover:text-accent-red"
                          aria-label="Remove line"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-ink-300/40 dark:border-night-border pt-3">
              <span className="text-xs text-ink-500 dark:text-night-muted">Total</span>
              <span className="text-base font-semibold text-ink-900 dark:text-night-text tabular-nums">
                {fmtMoney(projectedTotal)}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={() => setOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button variant="primary" onClick={save} disabled={saving || !valid}>
                {saving ? 'Placing…' : 'Place order'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
