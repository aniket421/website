import Link from 'next/link';
import { cn } from '@/lib/utils';

type Variant = 'brass' | 'dark' | 'glass' | 'outline';
type Size = 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2.5 rounded-full font-semibold ' +
  'transition-all duration-200 ease-subtle disabled:cursor-not-allowed disabled:opacity-60';

const variants: Record<Variant, string> = {
  brass: 'bg-brass text-ink hover:bg-brass-soft hover:shadow-brass',
  dark: 'bg-ink-soft text-surface hover:bg-ink',
  // Sits over the hero photograph; the border keeps it legible on light frames.
  glass:
    'bg-surface/15 text-surface backdrop-blur-md border border-surface/35 hover:bg-surface/25',
  outline: 'border border-line text-ink hover:border-brass hover:bg-brass-tint',
};

const sizes: Record<Size, string> = {
  md: 'h-11 px-5 text-[0.9375rem]',
  lg: 'h-[3.25rem] px-7 text-copy',
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

export function Button({
  variant = 'brass',
  size = 'md',
  className,
  children,
  ...props
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = 'brass',
  size = 'md',
  className,
  children,
  ...props
}: CommonProps & { href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const classes = cn(base, variants[variant], sizes[size], className);
  const isInternal = href.startsWith('/') || href.startsWith('#');

  if (isInternal) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={classes} {...props}>
      {children}
    </a>
  );
}
