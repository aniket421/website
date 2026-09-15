'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Images,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  MessageSquareQuote,
  Package,
  Store,
  Tags,
} from 'lucide-react';
import type { AdminSession } from '@/lib/admin-session';
import { site } from '@/lib/data/site';
import { cn } from '@/lib/utils';

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/enquiries', label: 'Enquiries', icon: ListOrdered },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/brands', label: 'Brands', icon: Store },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
  { href: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
  { href: '/admin/faqs', label: 'FAQs', icon: MessageSquareQuote },
  { href: '/admin/gallery', label: 'Gallery', icon: Images },
];

export function AdminNav({ session }: { session: AdminSession }) {
  const pathname = usePathname();

  return (
    <aside className="shrink-0 border-b border-line bg-surface lg:min-h-screen lg:w-[260px] lg:border-b-0 lg:border-r">
      <div className="px-gutter py-6 lg:px-6">
        <Link href="/admin" className="block leading-none">
          <span className="block text-[1.25rem] font-extrabold tracking-[-0.03em] text-ink">
            {site.wordmark.primary}
          </span>{' '}
          <span className="mt-1 block text-[0.55rem] font-bold uppercase tracking-[0.34em] text-brass-deep">
            Showroom admin
          </span>
        </Link>

        <nav aria-label="Admin" className="mt-7">
          <ul className="flex flex-wrap gap-1 lg:flex-col">
            {links.map((link) => {
              const Icon = link.icon;
              const active = link.exact
                ? pathname === link.href
                : pathname.startsWith(link.href);

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-sm px-3 py-2.5 text-[0.9375rem] font-medium transition-colors',
                      active ? 'bg-brass-tint text-ink' : 'text-body hover:bg-surface-alt hover:text-ink',
                    )}
                  >
                    <Icon aria-hidden="true" className="h-[1.125rem] w-[1.125rem] text-brass-deep" />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-8 border-t border-line pt-5">
          <p className="text-[0.8125rem] text-body">Signed in as</p>
          <p className="mt-0.5 truncate text-[0.9375rem] font-semibold text-ink">
            {session.name || session.email}
          </p>
          <p className="mt-0.5 text-[0.8125rem] text-body">{session.role}</p>

          <form action="/api/admin/signout" method="post" className="mt-4">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[0.875rem] font-semibold text-ink transition-colors hover:border-brass hover:bg-brass-tint"
            >
              <LogOut aria-hidden="true" className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
