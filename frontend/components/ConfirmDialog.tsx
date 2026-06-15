'use client';

import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

type Tone = 'danger' | 'primary';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  busy = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: Tone;
  busy?: boolean;
}) {
  const confirmClass =
    tone === 'danger'
      ? 'bg-accent-red text-white hover:bg-accent-red/90'
      : 'bg-ink-900 text-white hover:bg-ink-700 dark:bg-night-text dark:text-night-bg dark:hover:bg-white';

  return (
    <Modal open={open} onClose={busy ? () => {} : onClose} title={title}>
      <div className="flex gap-3">
        <div
          className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
            tone === 'danger'
              ? 'bg-accent-red/10 text-accent-red'
              : 'bg-accent-blue/10 text-accent-blue'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="text-sm text-ink-700 dark:text-night-text leading-relaxed">{message}</div>
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <Button onClick={onClose} disabled={busy}>
          {cancelLabel}
        </Button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={`notion-btn ${confirmClass}`}
        >
          {busy ? 'Working…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
