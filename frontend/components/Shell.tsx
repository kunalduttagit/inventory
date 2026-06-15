'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

export default function Shell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar — fixed so it doesn't scroll with content */}
      <aside className="hidden md:block fixed inset-y-0 left-0 w-60 z-20">
        <Sidebar />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[1px] md:hidden"
            />
            <motion.div
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', stiffness: 380, damping: 36 }}
              className="fixed inset-y-0 left-0 z-50 w-60 md:hidden"
            >
              <Sidebar onNavigate={() => setOpen(false)} />
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="absolute top-3 right-3 p-1.5 rounded-md text-ink-500 hover:bg-ink-300/30 dark:text-night-muted dark:hover:bg-night-surface"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Content column — left-padded on desktop to make room for the fixed sidebar */}
      <div className="flex flex-col min-h-screen md:pl-60">
        <header className="md:hidden sticky top-0 z-30 flex items-center gap-3 h-12 border-b border-ink-300/40 dark:border-night-border bg-paper/90 dark:bg-night-bg/90 backdrop-blur px-3">
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="p-1.5 -ml-1 rounded-md text-ink-700 dark:text-night-text hover:bg-ink-300/30 dark:hover:bg-night-surface"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Image
              src="/invlogo.png"
              alt=""
              width={20}
              height={20}
              className="rounded invert dark:invert-0"
            />
            <span className="text-sm font-semibold text-ink-900 dark:text-night-text">Inventory</span>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
