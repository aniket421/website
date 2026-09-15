import { cn } from '@/lib/utils';

/** Max content width 1360px with the 22px / 40px gutter from the design system. */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('mx-auto w-full max-w-content px-gutter lg:px-gutter-lg', className)}>
      {children}
    </div>
  );
}
