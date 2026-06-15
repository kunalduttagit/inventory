'use client';

import { motion } from 'framer-motion';

export default function Card({
  className = '',
  children,
  delay = 0,
}: {
  className?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: 'easeOut' }}
      className={`rounded-xl border border-ink-300/40 dark:border-night-border bg-white/60 dark:bg-night-surface transition-colors ${className}`}
    >
      {children}
    </motion.div>
  );
}
