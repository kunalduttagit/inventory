'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
          <div
            onClick={onClose}
            aria-hidden
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-lg max-h-[calc(100dvh-2rem)] flex flex-col bg-paper dark:bg-night-surface rounded-xl shadow-2xl border border-ink-300/40 dark:border-night-border overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-ink-300/40 dark:border-night-border px-5 py-3 shrink-0">
              <h2 className="text-sm font-semibold text-ink-900 dark:text-night-text">{title}</h2>
              <button
                onClick={onClose}
                className="text-ink-500 hover:text-ink-900 dark:text-night-muted dark:hover:text-night-text transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
