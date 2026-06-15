'use client';

import { LayoutDashboard, Package, ShoppingCart, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

const items = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, color: 'text-accent-blue' },
  { href: '/products', label: 'Products', icon: Package, color: 'text-accent-orange' },
  { href: '/customers', label: 'Customers', icon: Users, color: 'text-accent-purple' },
  { href: '/orders', label: 'Orders', icon: ShoppingCart, color: 'text-accent-green' },
];

export default function Sidebar({ onNavigate }: { onNavigate?: () => void } = {}) {
  const pathname = usePathname();

  return (
    <aside className="w-60 h-full flex flex-col border-r border-ink-300/40 dark:border-night-border bg-paper dark:bg-night-bg px-3 py-5 overflow-y-auto">
      <div className="flex items-center gap-2 px-2 mb-1">
        <Image
          src="/invlogo.png"
          alt=""
          width={22}
          height={22}
          className="rounded invert dark:invert-0"
          priority
        />
        <span className="text-sm font-semibold text-ink-900 dark:text-night-text tracking-tight">
          Inventory
        </span>
      </div>
      <p className="px-2 mb-6 text-[11px] leading-snug text-ink-500 dark:text-night-muted">
        Track products, customers, and orders in one place.
      </p>

      <nav className="flex flex-col gap-0.5">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`group relative flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                active
                  ? 'bg-ink-300/30 text-ink-900 font-medium dark:bg-night-surface dark:text-night-text'
                  : 'text-ink-500 hover:bg-ink-300/20 hover:text-ink-700 dark:text-night-muted dark:hover:bg-night-surface dark:hover:text-night-text'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? item.color : 'opacity-80 group-hover:opacity-100'}`} />
              <span>{item.label}</span>
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-md ring-1 ring-ink-300/50 dark:ring-night-border pointer-events-none"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-3 border-t border-ink-300/30 dark:border-night-border">
        <ThemeToggle />
      </div>
    </aside>
  );
}
