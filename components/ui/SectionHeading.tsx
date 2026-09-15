import { cn } from '@/lib/utils';

export function SectionHeading({
  eyebrow,
  title,
  lede,
  id,
  align = 'center',
  as: Heading = 'h2',
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lede?: string;
  id?: string;
  align?: 'center' | 'left';
  as?: 'h2' | 'h3';
  className?: string;
}) {
  const centered = align === 'center';

  return (
    <div className={cn(centered && 'text-center', className)}>
      <p className="text-eyebrow uppercase text-brass">{eyebrow}</p>
      <Heading id={id} className="mt-3 text-heading">
        {title}
      </Heading>
      {lede ? (
        <p className={cn('mt-4 max-w-lede text-lede', centered && 'mx-auto')}>{lede}</p>
      ) : null}
    </div>
  );
}
