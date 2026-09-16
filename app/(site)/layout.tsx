import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppWidget } from '@/components/layout/WhatsAppWidget';
import { site } from '@/lib/data/site';
import { getCategories } from '@/lib/queries/catalogue';
import { safeQuery } from '@/lib/queries/safe';
import '@/app/globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-manrope',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Tile and Bathware Showroom in Ghaziabad`,
    template: `%s — ${site.name}`,
  },
  description:
    'Premium multi-brand tile and bathware showroom in Ghaziabad. Designer tiles, sanitaryware, faucets, wash basins and large slabs from nine brands, in stock since 2009.',
  applicationName: site.name,
  openGraph: {
    type: 'website',
    siteName: site.name,
    locale: 'en_IN',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = await safeQuery('navCategories', () => getCategories(), []);

  return (
    <html lang="en-IN" className={manrope.variable}>
      <head>
        {/*
          Scroll reveals start hidden and are shown by JavaScript. Without it
          nothing would ever be revealed, so this turns the whole mechanism off
          and every section renders in its final state.
        */}
        <noscript>
          {/* eslint-disable-next-line react/no-danger */}
          <style
            dangerouslySetInnerHTML={{
              __html:
                '.reveal,.split-text__word{opacity:1!important;transform:none!important;filter:none!important}',
            }}
          />
        </noscript>
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-sm focus:bg-ink focus:px-4 focus:py-2.5 focus:text-surface"
        >
          Skip to main content
        </a>
        <Header categories={categories} />
        <main id="main">{children}</main>
        <Footer />
        <WhatsAppWidget />
      </body>
    </html>
  );
}
