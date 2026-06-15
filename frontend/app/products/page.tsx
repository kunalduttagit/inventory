'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { AnimatePresence, motion } from 'framer-motion';
import { Package, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, fetcher, type Product } from '@/lib/api';
import { fmtMoney } from '@/lib/format';
import PageHeader from '@/components/PageHeader';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import Input from '@/components/Input';
import EmptyState from '@/components/EmptyState';
import { useConfirm } from '@/hooks/useConfirm';

type Form = { name: string; sku: string; price: string; quantity: string; description: string };
const empty: Form = { name: '', sku: '', price: '', quantity: '', description: '' };

export default function ProductsPage() {
  const { data: products, isLoading } = useSWR<Product[]>('/products', fetcher);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Form>(empty);
  const [saving, setSaving] = useState(false);
  const { confirm, dialog: confirmDialog } = useConfirm();

  const startCreate = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const startEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      sku: p.sku,
      price: p.price,
      quantity: String(p.quantity),
      description: p.description ?? '',
    });
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity, 10),
        description: form.description.trim() || null,
      };
      if (editing) {
        await api(`/products/${editing.id}`, { method: 'PUT', body: JSON.stringify(body) });
        toast.success('Product updated');
      } else {
        await api('/products', { method: 'POST', body: JSON.stringify(body) });
        toast.success('Product created');
      }
      mutate('/products');
      mutate('/dashboard');
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: Product) => {
    const ok = await confirm({
      title: 'Delete product',
      message: (
        <>
          Delete <span className="font-medium text-ink-900 dark:text-night-text">{p.name}</span>?
          This can&apos;t be undone.
        </>
      ),
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    try {
      await api(`/products/${p.id}`, { method: 'DELETE' });
      toast.success('Deleted');
      mutate('/products');
      mutate('/dashboard');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const filtered = (products ?? []).filter(
    (p) =>
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.sku.toLowerCase().includes(q.toLowerCase())
  );

  const formValid =
    form.name.trim() !== '' &&
    form.sku.trim() !== '' &&
    form.price !== '' &&
    form.quantity !== '' &&
    !Number.isNaN(parseFloat(form.price)) &&
    !Number.isNaN(parseInt(form.quantity, 10));

  return (
    <div className="px-6 md:px-10 py-8 md:py-10 max-w-5xl mx-auto">
      <PageHeader
        title="Products"
        description="Catalog of everything you stock."
        icon={Package}
        iconColor="text-accent-orange"
        action={
          <Button variant="primary" onClick={startCreate}>
            <Plus className="w-4 h-4" /> New product
          </Button>
        }
      />

      <div className="flex items-center gap-2 mb-4 text-ink-500 dark:text-night-muted border-b border-ink-300/30 dark:border-night-border pb-2">
        <Search className="w-4 h-4" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or SKU…"
          className="flex-1 bg-transparent text-sm outline-none placeholder-ink-500/60 dark:placeholder-night-muted/60 text-ink-700 dark:text-night-text"
        />
      </div>

      {isLoading && <div className="text-sm text-ink-500 dark:text-night-muted py-8">Loading…</div>}

      {!isLoading && filtered.length === 0 && (
        <EmptyState
          icon={Package}
          title={q ? 'No matches' : 'No products yet'}
          description={q ? 'Try a different search.' : 'Start by adding your first product.'}
          action={
            !q && (
              <Button variant="primary" onClick={startCreate}>
                <Plus className="w-4 h-4" /> New product
              </Button>
            )
          }
        />
      )}

      {filtered.length > 0 && (
        <div className="text-sm">
          <div className="grid grid-cols-12 gap-3 py-2 text-xs font-medium text-ink-500 dark:text-night-muted border-b border-ink-300/40 dark:border-night-border">
            <div className="col-span-4">Name</div>
            <div className="col-span-3">SKU</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">Stock</div>
            <div className="col-span-1" />
          </div>
          <AnimatePresence initial={false}>
            {filtered.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="group grid grid-cols-12 gap-3 items-center py-2.5 border-b border-ink-300/20 dark:border-night-border/60 hover:bg-ink-300/10 dark:hover:bg-night-surface/60 transition-colors px-1 -mx-1 rounded"
              >
                <div className="col-span-4 text-ink-900 dark:text-night-text truncate">{p.name}</div>
                <div className="col-span-3 text-ink-500 dark:text-night-muted font-mono text-xs truncate">{p.sku}</div>
                <div className="col-span-2 text-right tabular-nums text-ink-700 dark:text-night-text">{fmtMoney(p.price)}</div>
                <div className="col-span-2 text-right tabular-nums">
                  <span className={p.quantity < 10 ? 'text-accent-red font-medium' : 'text-ink-700 dark:text-night-text'}>
                    {p.quantity}
                  </span>
                </div>
                <div className="col-span-1 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(p)}
                    className="p-1 rounded hover:bg-ink-300/30 dark:hover:bg-night-border text-ink-500 dark:text-night-muted"
                    aria-label="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => remove(p)}
                    className="p-1 rounded hover:bg-accent-red/10 text-accent-red"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {confirmDialog}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit product' : 'New product'}>
        <div className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Mechanical Keyboard"
            autoFocus
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="SKU"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              placeholder="KB-001"
            />
            <Input
              label="Price (₹)"
              type="number"
              step="1"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="4999"
            />
          </div>
          <Input
            label="Quantity in stock"
            type="number"
            min="0"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            placeholder="100"
          />
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Optional"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={save} disabled={saving || !formValid}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create product'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
