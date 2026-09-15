import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import '@/app/globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-manrope',
});

/**
 * Root shell for the admin. Separate from the marketing shell so admin pages
 * do not inherit the public header, footer and floating WhatsApp button.
 */
export const metadata: Metadata = {
  title: { default: 'Showroom admin', template: '%s — Showroom admin' },
  // An admin surface has no business in a search index.
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={manrope.variable}>
      <body className="bg-surface-alt">{children}</body>
    </html>
  );
}
