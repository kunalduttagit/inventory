'use client';

import { useCallback, useRef, useState } from 'react';
import ConfirmDialog from '@/components/ConfirmDialog';

type Options = {
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
};

type State = (Options & { open: boolean; busy: boolean }) | null;

export function useConfirm() {
  const [state, setState] = useState<State>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback((opts: Options) => {
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
      setState({ ...opts, open: true, busy: false });
    });
  }, []);

  const close = (value: boolean) => {
    const r = resolver.current;
    resolver.current = null;
    setState((s) => (s ? { ...s, open: false } : s));
    r?.(value);
  };

  const dialog = state ? (
    <ConfirmDialog
      open={state.open}
      onClose={() => close(false)}
      onConfirm={() => close(true)}
      title={state.title}
      message={state.message}
      confirmLabel={state.confirmLabel}
      cancelLabel={state.cancelLabel}
      tone={state.tone}
      busy={state.busy}
    />
  ) : null;

  return { confirm, dialog };
}
