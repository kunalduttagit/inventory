'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'ghost' | 'danger' | 'subtle';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const styles: Record<Variant, string> = {
  primary:
    'bg-ink-900 text-white hover:bg-ink-700 dark:bg-night-text dark:text-night-bg dark:hover:bg-white',
  ghost:
    'bg-transparent text-ink-700 hover:bg-ink-300/30 dark:text-night-text dark:hover:bg-night-surface',
  subtle:
    'bg-ink-300/30 text-ink-700 hover:bg-ink-300/50 dark:bg-night-surface dark:text-night-text dark:hover:bg-night-border',
  danger: 'bg-transparent text-accent-red hover:bg-accent-red/10',
};

const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = 'ghost', className = '', children, ...rest }, ref) => {
    return (
      <button ref={ref} {...rest} className={`notion-btn ${styles[variant]} ${className}`}>
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
export default Button;
