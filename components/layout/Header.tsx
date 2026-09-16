'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { ArrowUpRight, ChevronDown, Menu, Phone, X } from 'lucide-react';
import { enquiryHref, isCurrent, navLinks } from '@/lib/data/nav';
import { site, telUrl } from '@/lib/data/site';
import { useScroll, useScrollLock } from '@/lib/motion/hooks';
import { Container } from '@/components/ui/Container';
import { Magnetic } from '@/components/motion/Magnetic';
import { ScrollProgress } from '@/components/motion/ScrollProgress';
import { cn } from '@/lib/utils';

export type NavCategory = { id: string; name: string; slug: string };

export function Header({ categories }: { categories: NavCategory[] }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [onDark, setOnDark] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const bandEnd = useRef(0);
  const [productsOpen, setProductsOpen] = useState(false);
  const productsRef = useRef<HTMLLIElement>(null);
  const productsMenuId = useId();

  useScrollLock(mobileOpen);

  /*
   * Three states, because the header crosses two different backgrounds:
   *
   *   at rest       transparent, white type — it sits on the dark band every
   *                 page opens with.
   *   scrolling,    dark frosted glass, white type — content is now passing
   *   still on the  underneath and needs something to pass under, but the band
   *   dark band     behind is still dark.
   *   past the band light frosted glass, ink type — the page is white here.
   *
   * That first state is a contract: a page under (site) must open with an
   * element marked `data-dark-band`, or white nav type lands on a white
   * surface. <PageHero> carries the marker, which is why the two legal pages
   * use it too. A page without one measures a band of zero and goes light
   * immediately, which is the safe way to be wrong.
   */
  const solid = scrolled || mobileOpen;
  // The mobile drawer is a white sheet, so the header above it has to be light.
  const dark = onDark && !mobileOpen;

  /*
   * Measured once per route and on resize — never inside the scroll loop,
   * where reading layout after another subscriber has written a style forces a
   * synchronous reflow on every frame.
   */
  useEffect(() => {
    const measure = () => {
      const band = document.querySelector('[data-dark-band]');
      const height = band ? band.getBoundingClientRect().height : 0;
      // The header's own height: the band stops being "behind" it at that point.
      bandEnd.current = Math.max(0, height - (window.innerWidth >= 860 ? 84 : 76));
      setOnDark(window.scrollY <= bandEnd.current);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [pathname]);

  useScroll(({ y }) => {
    const nextScrolled = y > 40;
    const nextOnDark = y <= bandEnd.current;
    setScrolled((current) => (current === nextScrolled ? current : nextScrolled));
    setOnDark((current) => (current === nextOnDark ? current : nextOnDark));
  });

  // Route changes close whatever was open, including a back-button navigation.
  useEffect(() => {
    setMobileOpen(false);
    setProductsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setProductsOpen(false);
      setMobileOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!productsRef.current?.contains(event.target as Node)) setProductsOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, []);

  const closeAll = useCallback(() => {
    setMobileOpen(false);
    setProductsOpen(false);
  }, []);

  const textTone = dark ? 'text-surface' : 'text-ink';
  const mutedTone = dark
    ? 'text-surface/80 hover:text-surface'
    : 'text-body hover:text-ink';

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-500 ease-subtle',
        !solid && 'border-transparent bg-transparent',
        solid && dark && 'glass-dark border-surface/10',
        // Opaque behind the open drawer: the drawer is a solid white sheet,
        // and a translucent bar above it shows the hero through as grey.
        solid && !dark && mobileOpen && 'border-line bg-surface',
        solid && !dark && !mobileOpen &&
          'glass border-line shadow-[0_10px_40px_-28px_rgba(26,26,26,0.4)]',
      )}
    >
      <Container>
        <div className="flex h-[76px] items-center justify-between gap-6 nav:h-[84px]">
          <Link
            href="/"
            onClick={closeAll}
            className={cn('group shrink-0 leading-none', textTone)}
            aria-label={`${site.name} — home`}
          >
            <span className="block text-[1.5rem] font-extrabold tracking-[-0.03em]">
              {site.wordmark.primary}
            </span>
            <span
              className={cn(
                'mt-0.5 block text-[0.6rem] font-bold uppercase tracking-[0.34em] transition-[letter-spacing] duration-500 ease-out-expo group-hover:tracking-[0.42em]',
                dark ? 'text-brass' : 'text-brass-deep',
              )}
            >
              {site.wordmark.secondary}
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden nav:block">
            <ul className="flex items-center gap-1">
              {navLinks.map((link) => {
                const current = isCurrent(link.href, pathname);
                const isProducts = link.label === 'Products';

                return (
                  <li
                    key={link.href}
                    className="relative"
                    ref={isProducts ? productsRef : undefined}
                    onMouseEnter={isProducts ? () => setProductsOpen(true) : undefined}
                    onMouseLeave={isProducts ? () => setProductsOpen(false) : undefined}
                  >
                    <div className="flex items-center">
                      <Link
                        href={link.href}
                        aria-current={current ? 'page' : undefined}
                        className={cn(
                          'relative rounded-full px-4 py-2.5 text-[0.9375rem] font-medium transition-colors duration-300',
                          current ? textTone : mutedTone,
                        )}
                      >
                        {link.label}
                        {/*
                          The current-page marker. A hairline scaled from the
                          centre rather than a width transition, so the whole
                          indicator stays on the compositor.
                        */}
                        <span
                          aria-hidden="true"
                          className={cn(
                            'absolute inset-x-4 -bottom-0.5 h-[2px] rounded-full bg-brass transition-transform duration-500 ease-out-expo',
                            current ? 'scale-x-100' : 'scale-x-0',
                          )}
                        />
                      </Link>

                      {isProducts && categories.length > 0 ? (
                        <button
                          type="button"
                          aria-expanded={productsOpen}
                          aria-controls={productsMenuId}
                          aria-label={
                            productsOpen ? 'Hide product categories' : 'Show product categories'
                          }
                          onClick={() => setProductsOpen((open) => !open)}
                          className={cn('-ml-2.5 p-1 transition-colors duration-300', mutedTone)}
                        >
                          <ChevronDown
                            aria-hidden="true"
                            className={cn(
                              'h-4 w-4 transition-transform duration-400 ease-spring',
                              productsOpen && 'rotate-180',
                            )}
                          />
                        </button>
                      ) : null}
                    </div>

                    {isProducts && categories.length > 0 ? (
                      <div
                        id={productsMenuId}
                        className={cn(
                          'absolute left-1/2 top-full z-10 w-[340px] -translate-x-1/2 pt-4',
                          !productsOpen && 'pointer-events-none',
                        )}
                        aria-hidden={!productsOpen}
                      >
                        <div
                          className={cn(
                            'origin-top rounded-panel border border-line bg-surface p-2.5 shadow-panel',
                            'transition-[opacity,transform] duration-400 ease-out-expo',
                            productsOpen
                              ? 'translate-y-0 scale-100 opacity-100'
                              : '-translate-y-2 scale-[0.97] opacity-0',
                          )}
                        >
                          <p className="px-3 pb-2 pt-1.5 text-eyebrow uppercase text-brass-deep">
                            Collections
                          </p>
                          <ul className="grid grid-cols-2 gap-1">
                            {categories.map((category) => (
                              <li key={category.slug}>
                                <Link
                                  href={`/products?category=${category.slug}`}
                                  tabIndex={productsOpen ? undefined : -1}
                                  onClick={closeAll}
                                  className="group flex items-center justify-between gap-2 rounded-sm px-3 py-2.5 text-[0.875rem] text-body transition-colors duration-200 hover:bg-brass-tint hover:text-ink"
                                >
                                  <span>{category.name}</span>
                                  <ArrowUpRight
                                    aria-hidden="true"
                                    className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-300 ease-out-expo group-hover:translate-x-0 group-hover:opacity-100"
                                  />
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={telUrl}
              className={cn(
                'hidden items-center gap-2 text-[0.9375rem] font-semibold transition-colors nav:flex',
                textTone,
              )}
            >
              <Phone aria-hidden="true" className="h-4 w-4 text-brass" />
              <span>{site.phone.display}</span>
            </a>

            <Magnetic className="hidden nav:inline-flex">
              <Link
                href={enquiryHref}
                onClick={closeAll}
                className={cn(
                  'group relative inline-flex h-11 items-center gap-2 overflow-hidden rounded-full px-5 text-[0.9375rem] font-semibold',
                  'bg-ink-soft text-surface transition-colors duration-300 hover:bg-ink',
                  dark ? 'border border-surface/25' : 'border border-transparent',
                )}
              >
                {/* A brass wash that sweeps through on hover. */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(200,164,93,0.45),transparent)] transition-transform duration-700 ease-out-expo group-hover:translate-x-full"
                />
                <span className="relative">Send Enquiry</span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="relative h-4 w-4 transition-transform duration-400 ease-spring group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </Magnetic>

            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              className={cn(
                'inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-300 nav:hidden',
                dark ? 'border-surface/35 text-surface' : 'border-line text-ink',
              )}
            >
              {mobileOpen ? (
                <X aria-hidden="true" className="h-5 w-5" />
              ) : (
                <Menu aria-hidden="true" className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </Container>

      <ScrollProgress />

      <MobileNav
        open={mobileOpen}
        categories={categories}
        pathname={pathname}
        onNavigate={closeAll}
      />
    </header>
  );
}

function MobileNav({
  open,
  categories,
  pathname,
  onNavigate,
}: {
  open: boolean;
  categories: NavCategory[];
  pathname: string;
  onNavigate: () => void;
}) {
  return (
    <div
      id="mobile-nav"
      aria-hidden={!open}
      className={cn(
        'origin-top overflow-hidden border-t bg-surface transition-[max-height,opacity] duration-500 ease-out-expo nav:hidden',
        open
          ? 'max-h-[calc(100svh-76px)] overflow-y-auto border-line opacity-100'
          : 'max-h-0 border-transparent opacity-0',
      )}
    >
      <Container>
        <nav aria-label="Mobile" className="py-6">
          <ul className="flex flex-col">
            {navLinks.map((link, index) => (
              <li key={link.href} className="border-b border-line last:border-b-0">
                <Link
                  href={link.href}
                  onClick={onNavigate}
                  tabIndex={open ? undefined : -1}
                  aria-current={isCurrent(link.href, pathname) ? 'page' : undefined}
                  style={{ transitionDelay: open ? `${80 + index * 55}ms` : '0ms' }}
                  className={cn(
                    'flex items-center justify-between py-4 text-[1.125rem] font-semibold transition-[opacity,transform] duration-500 ease-out-expo',
                    isCurrent(link.href, pathname) ? 'text-brass-deep' : 'text-ink',
                    open ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0',
                  )}
                >
                  {link.label}
                  <ArrowUpRight aria-hidden="true" className="h-4 w-4 text-brass" />
                </Link>
              </li>
            ))}
          </ul>

          {categories.length > 0 ? (
            <>
              <p className="mt-7 text-eyebrow uppercase text-brass-deep">Collections</p>
              <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
                {categories.map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={`/products?category=${category.slug}`}
                      onClick={onNavigate}
                      tabIndex={open ? undefined : -1}
                      className="block py-1 text-[0.9375rem] text-body"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          <div className="mt-8 flex flex-col gap-3">
            <a
              href={telUrl}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-line text-[0.9375rem] font-semibold text-ink"
            >
              <Phone aria-hidden="true" className="h-4 w-4 text-brass" />
              {site.phone.display}
            </a>
            <Link
              href={enquiryHref}
              onClick={onNavigate}
              tabIndex={open ? undefined : -1}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink-soft text-[0.9375rem] font-semibold text-surface"
            >
              Send Enquiry
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </nav>
      </Container>
    </div>
  );
}
