'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, Props>(({ label, hint, className = '', ...rest }, ref) => {
  return (
    <label className="block">
      {label && (
        <span className="block text-xs font-medium text-ink-500 dark:text-night-muted mb-0.5">{label}</span>
      )}
      <input ref={ref} {...rest} className={`notion-input ${className}`} />
      {hint && (
        <span className="block text-[11px] text-ink-500/70 dark:text-night-muted/70 mt-1">{hint}</span>
      )}
    </label>
  );
});
Input.displayName = 'Input';
export default Input;
