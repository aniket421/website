import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { getBrands, getCategories } from '@/lib/queries/catalogue';
import { footerQuickLinks } from '@/lib/data/nav';
import { fullAddress, mailtoUrl, site, telUrl } from '@/lib/data/site';

const year = new Date().getFullYear();

export async function Footer() {
  const [brands, categories] = await Promise.all([getBrands(), getCategories()]);

  return (
    <footer className="on-dark bg-footer text-surface/70">
      <Container>
        <div className="grid gap-12 py-section-sm lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-10 lg:py-section">
          <div>
            <p className="leading-none text-surface">
              <span className="block text-[1.5rem] font-extrabold tracking-[-0.03em]">
                {site.wordmark.primary}
              </span>
              <span className="mt-1 block text-[0.6rem] font-bold uppercase tracking-[0.34em] text-brass">
                {site.wordmark.secondary}
              </span>
            </p>

            <p className="mt-6 max-w-[42ch] text-[0.9375rem] leading-[1.7]">
              A multi-brand tile and bathware showroom in Ghaziabad, trading
              since {site.established}. Nine brands on one floor, lit and laid
              out so you can compare finishes properly before you decide.
            </p>

            <ul className="mt-7 space-y-3.5 text-[0.9375rem]">
              <li>
                <a href={telUrl} className="flex items-start gap-3 transition-colors hover:text-surface">
                  <Phone aria-hidden="true" className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0 text-brass" />
                  <span>{site.phone.display}</span>
                </a>
              </li>
              <li>
                <a href={mailtoUrl} className="flex items-start gap-3 transition-colors hover:text-surface">
                  <Mail aria-hidden="true" className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0 text-brass" />
                  <span>{site.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin aria-hidden="true" className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0 text-brass" />
                <address className="not-italic">{fullAddress}</address>
              </li>
            </ul>
          </div>

          <FooterColumn title="Quick Links">
            {footerQuickLinks.map((link) => (
              <FooterLink key={link.href} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Products">
            {categories.map((category) => (
              <FooterLink key={category.slug} href={`#${category.slug}`}>
                {category.name}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Our Brands">
            {brands.map((brand) => (
              <li key={brand.slug} className="text-[0.9375rem]">
                {brand.name}
              </li>
            ))}
          </FooterColumn>
        </div>

        <div className="flex flex-col gap-4 border-t border-surface/10 py-7 text-[0.875rem] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. All rights reserved.
          </p>
          <ul className="flex items-center gap-6">
            <li>
              <Link href="/privacy-policy" className="transition-colors hover:text-surface">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="transition-colors hover:text-surface">
                Terms
              </Link>
            </li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-eyebrow uppercase text-brass">{title}</h2>
      <ul className="mt-5 space-y-3">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-[0.9375rem] transition-colors hover:text-surface">
        {children}
      </Link>
    </li>
  );
}
