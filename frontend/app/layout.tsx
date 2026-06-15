import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';
import Shell from '@/components/Shell';

export const metadata: Metadata = {
  title: 'Inventory',
  description: 'Manage products, customers, and orders — all in one place.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#191919',
  width: 'device-width',
  initialScale: 1,
};

const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='light')document.documentElement.classList.remove('dark');}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-paper text-ink-700 dark:bg-night-bg dark:text-night-text transition-colors">
        <Shell>{children}</Shell>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#37352f',
              color: '#fff',
              fontSize: '13px',
              borderRadius: '8px',
              padding: '8px 12px',
            },
          }}
        />
      </body>
    </html>
  );
}
