'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, Phone, Plus, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, fetcher, type Customer } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import Input from '@/components/Input';
import EmptyState from '@/components/EmptyState';
import { useConfirm } from '@/hooks/useConfirm';

type Form = { full_name: string; email: string; phone: string };
const empty: Form = { full_name: '', email: '', phone: '' };

export default function CustomersPage() {
  const { data: customers, isLoading } = useSWR<Customer[]>('/customers', fetcher);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(empty);
  const [saving, setSaving] = useState(false);
  const { confirm, dialog: confirmDialog } = useConfirm();

  const save = async () => {
    setSaving(true);
    try {
      await api('/customers', {
        method: 'POST',
        body: JSON.stringify({
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
        }),
      });
      toast.success('Customer added');
      mutate('/customers');
      mutate('/dashboard');
      setOpen(false);
      setForm(empty);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: Customer) => {
    const ok = await confirm({
      title: 'Delete customer',
      message: (
        <>
          Delete <span className="font-medium text-ink-900 dark:text-night-text">{c.full_name}</span>?
          This can&apos;t be undone.
        </>
      ),
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    try {
      await api(`/customers/${c.id}`, { method: 'DELETE' });
      toast.success('Deleted');
      mutate('/customers');
      mutate('/dashboard');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const valid = form.full_name.trim() && form.email.trim() && form.phone.trim();

  return (
    <div className="px-6 md:px-10 py-8 md:py-10 max-w-5xl mx-auto">
      <PageHeader
        title="Customers"
        description="Everyone you sell to."
        icon={Users}
        iconColor="text-accent-purple"
        action={
          <Button variant="primary" onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4" /> New customer
          </Button>
        }
      />

      {isLoading && <div className="text-sm text-ink-500 dark:text-night-muted py-8">Loading…</div>}
      {!isLoading && (customers?.length ?? 0) === 0 && (
        <EmptyState
          icon={Users}
          title="No customers yet"
          description="Add your first customer to get started."
          action={
            <Button variant="primary" onClick={() => setOpen(true)}>
              <Plus className="w-4 h-4" /> New customer
            </Button>
          }
        />
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <AnimatePresence initial={false}>
          {customers?.map((c) => (
            <motion.div
              key={c.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              whileHover={{ y: -2 }}
              className="group relative rounded-lg border border-ink-300/40 dark:border-night-border bg-white/50 dark:bg-night-surface p-4 hover:bg-white dark:hover:bg-night-border/60 transition-colors"
            >
              <div className="text-sm font-medium text-ink-900 dark:text-night-text truncate pr-6">{c.full_name}</div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-ink-500 dark:text-night-muted truncate">
                <Mail className="w-3 h-3 shrink-0 text-accent-blue" />
                <span className="truncate">{c.email}</span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-ink-500 dark:text-night-muted">
                <Phone className="w-3 h-3 shrink-0 text-accent-green" />
                <span>{c.phone}</span>
              </div>
              <button
                onClick={() => remove(c)}
                className="absolute top-2 right-2 p-1 rounded text-ink-500 dark:text-night-muted hover:bg-accent-red/10 hover:text-accent-red opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Delete customer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {confirmDialog}

      <Modal open={open} onClose={() => setOpen(false)} title="New customer">
        <div className="space-y-4">
          <Input
            label="Full name"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            placeholder="Jane Doe"
            autoFocus
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="jane@example.com"
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+1 555 123 4567"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={save} disabled={saving || !valid}>
              {saving ? 'Saving…' : 'Create customer'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
