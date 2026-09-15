import { Container } from '@/components/ui/Container';
import { stats } from '@/lib/data/stats';

export function Stats() {
  return (
    <section
      aria-label="Showroom at a glance"
      className="border-y border-line bg-surface-alt py-12 lg:py-16"
    >
      <Container>
        <dl className="grid grid-cols-1 gap-10 text-center sm:grid-cols-3 sm:gap-6">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block text-[clamp(2rem,1.4rem+2.4vw,2.75rem)] font-extrabold tracking-[-0.03em] text-ink">
                  {stat.figure}
                </span>
                <span className="mt-2 block text-[0.9375rem] font-medium text-body">
                  {stat.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
