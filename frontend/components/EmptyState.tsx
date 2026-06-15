import type { LucideIcon } from 'lucide-react';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon className="w-10 h-10 text-ink-500/50 dark:text-night-muted/50 mb-3" strokeWidth={1.5} />
      <h3 className="text-sm font-medium text-ink-900 dark:text-night-text">{title}</h3>
      {description && (
        <p className="text-xs text-ink-500 dark:text-night-muted mt-1 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
