export type NavLink = { label: string; href: string };

/** Primary navigation. The Products entry opens the category dropdown. */
export const navLinks: NavLink[] = [
  { label: 'Home', href: '#top' },
  { label: 'About', href: '#about' },
  { label: 'Products', href: '#products' },
  { label: 'Brands', href: '#brands' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Contact', href: '#contact' },
];

export const footerQuickLinks: NavLink[] = [
  { label: 'Home', href: '#top' },
  { label: 'About the showroom', href: '#about' },
  { label: 'Product categories', href: '#products' },
  { label: 'Partner brands', href: '#brands' },
  { label: 'Showroom walkthrough', href: '#gallery' },
  { label: 'Contact us', href: '#contact' },
];
