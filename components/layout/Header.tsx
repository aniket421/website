'use client';

import Link from 'next/link';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, Menu, Phone, X } from 'lucide-react';
import { categories } from '@/lib/data/categories';
import { navLinks } from '@/lib/data/nav';
import { site, telUrl } from '@/lib/data/site';
import { Container } from '@/components/ui/Container';
import { cn } from '@/lib/utils';

const SCROLL_THRESHOLD = 60;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const productsRef = useRef<HTMLLIElement>(null);
  const productsMenuId = useId();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Escape closes whichever layer is open; a click outside closes the dropdown.
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

  // Transparent over the hero, solid once the hero is behind you.
  const solid = scrolled || mobileOpen;
  const textTone = solid ? 'text-ink' : 'text-surface';
  const mutedTone = solid ? 'text-body hover:text-ink' : 'text-surface/85 hover:text-surface';

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300 ease-subtle',
        solid ? 'border-b border-line bg-surface/90 backdrop-blur-md' : 'bg-transparent',
      )}
    >
      <Container>
        <div className="flex h-[76px] items-center justify-between gap-6 lg:h-[84px]">
          <Link
            href="#top"
            onClick={closeAll}
            className={cn('shrink-0 leading-none', textTone)}
            aria-label={`${site.name} — home`}
          >
            <span className="block text-[1.5rem] font-extrabold tracking-[-0.03em]">
              {site.wordmark.primary}
            </span>
            <span className="mt-0.5 block text-[0.6rem] font-bold uppercase tracking-[0.34em] text-brass">
              {site.wordmark.secondary}
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden nav:block">
            <ul className="flex items-center gap-8">
              {navLinks.map((link) =>
                link.label === 'Products' ? (
                  <li key={link.href} className="relative" ref={productsRef}>
                    <div
                      onMouseEnter={() => setProductsOpen(true)}
                      onMouseLeave={() => setProductsOpen(false)}
                    >
                      <button
                        type="button"
                        aria-expanded={productsOpen}
                        aria-controls={productsMenuId}
                        onClick={() => setProductsOpen((open) => !open)}
                        className={cn(
                          'flex items-center gap-1.5 py-2 text-[0.9375rem] font-medium transition-colors',
                          mutedTone,
                        )}
                      >
                        {link.label}
                        <ChevronDown
                          aria-hidden="true"
                          className={cn(
                            'h-4 w-4 transition-transform duration-200',
                            productsOpen && 'rotate-180',
                          )}
                        />
                      </button>
                      <div
                        id={productsMenuId}
                        hidden={!productsOpen}
                        className="absolute left-1/2 top-full z-10 w-[280px] -translate-x-1/2 pt-3"
                      >
                        <ul className="rounded-card border border-line bg-surface p-2 shadow-panel">
                          {categories.map((category) => (
                            <li key={category.slug}>
                              <Link
                                href={`#${category.slug}`}
                                onClick={closeAll}
                                className="block rounded-sm px-3 py-2.5 text-[0.9375rem] text-body transition-colors hover:bg-brass-tint hover:text-ink"
                              >
                                {category.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </li>
                ) : (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        'block py-2 text-[0.9375rem] font-medium transition-colors',
                        mutedTone,
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ),
              )}
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

            <Link
              href="#contact"
              onClick={closeAll}
              className="hidden h-11 items-center rounded-full bg-ink-soft px-5 text-[0.9375rem] font-semibold text-surface transition-colors duration-200 hover:bg-ink nav:inline-flex"
            >
              Get In Touch
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              className={cn(
                'inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors nav:hidden',
                solid ? 'border-line text-ink' : 'border-surface/35 text-surface',
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

      <div
        id="mobile-nav"
        hidden={!mobileOpen}
        className="border-t border-line bg-surface nav:hidden"
      >
        <Container>
          <nav aria-label="Mobile" className="py-6">
            <ul className="flex flex-col">
              {navLinks.map((link) => (
                <li key={link.href} className="border-b border-line last:border-b-0">
                  <Link
                    href={link.href}
                    onClick={closeAll}
                    className="block py-3.5 text-[1.0625rem] font-semibold text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <p className="mt-6 text-eyebrow uppercase text-brass">Collections</p>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`#${category.slug}`}
                    onClick={closeAll}
                    className="block text-[0.9375rem] text-body"
                  >
                    {category.title}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-col gap-3">
              <a
                href={telUrl}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-line text-[0.9375rem] font-semibold text-ink"
              >
                <Phone aria-hidden="true" className="h-4 w-4 text-brass" />
                {site.phone.display}
              </a>
              <Link
                href="#contact"
                onClick={closeAll}
                className="inline-flex h-12 items-center justify-center rounded-full bg-ink-soft text-[0.9375rem] font-semibold text-surface"
              >
                Get In Touch
              </Link>
            </div>
          </nav>
        </Container>
      </div>
    </header>
  );
}
