export type NavLink = { label: string; href: string };

/**
 * The primary navigation — four destinations, each its own route.
 *
 * Products opens a panel of categories on hover or focus; the link itself
 * still goes to /products, so it works for touch, for keyboard and for a
 * crawler that never opens the panel.
 */
export const navLinks: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Contact', href: '/contact' },
];

/** Where the header and hero send someone ready to talk to a consultant. */
export const enquiryHref = '/enquiry';

export const footerQuickLinks: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Product catalogue', href: '/products' },
  { label: 'Showroom gallery', href: '/gallery' },
  { label: 'Contact us', href: '/contact' },
  { label: 'Send an enquiry', href: '/enquiry' },
];

/**
 * True when `href` is the page currently being viewed. `/` has to match
 * exactly or it would light up on every route; the rest match their subtree so
 * a product detail page keeps Products marked as current.
 */
export function isCurrent(href: string, pathname: string): boolean {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}
