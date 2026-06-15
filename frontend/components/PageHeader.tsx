'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

export default function PageHeader({
  title,
  description,
  icon: Icon,
  iconColor = 'text-ink-700 dark:text-night-text',
  action,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex items-start justify-between gap-4 mb-8"
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="mt-1">
            <Icon className={`w-7 h-7 ${iconColor}`} strokeWidth={1.8} />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-semibold text-ink-900 dark:text-night-text tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-ink-500 dark:text-night-muted mt-1">{description}</p>
          )}
        </div>
      </div>
      {action}
    </motion.div>
  );
}
