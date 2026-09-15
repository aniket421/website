import Link from 'next/link';
import { cn } from '@/lib/utils';

/** Small shared pieces for the admin screens. */

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[1.625rem] font-extrabold tracking-[-0.02em] text-ink">{title}</h1>
        {description ? <p className="mt-1.5 text-[0.9375rem]">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('rounded-card border border-line bg-surface p-6', className)}>
      {children}
    </div>
  );
}

export function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card>
      <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-body">
        {label}
      </p>
      <p className="mt-2 text-[2rem] font-extrabold tracking-[-0.03em] text-ink">{value}</p>
    </Card>
  );
}

const STATUS_STYLES: Record<string, string> = {
  NEW: 'border-brass bg-brass-tint text-ink',
  CONTACTED: 'border-line bg-surface-alt text-ink',
  QUOTED: 'border-line bg-surface-alt text-ink',
  CLOSED: 'border-line bg-surface text-body',
  SPAM: 'border-line bg-surface text-body line-through',
};

export function StatusChip({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-[0.75rem] font-semibold',
        STATUS_STYLES[status] ?? 'border-line bg-surface text-body',
      )}
    >
      {status}
    </span>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card className="text-center">
      <p className="text-card text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-[46ch] text-[0.9375rem]">{description}</p>
    </Card>
  );
}

export function AdminLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="font-semibold text-ink underline decoration-brass underline-offset-4 transition-colors hover:text-brass-deep"
    >
      {children}
    </Link>
  );
}

/** Dates render in IST — the showroom's clock, not the server's. */
export function formatDateTime(value: Date): string {
  return value.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
