import Image from 'next/image';
import { brands } from '@/lib/data/brands';
import { Container } from '@/components/ui/Container';

/**
 * The list is rendered twice and the track translates by exactly -50%, so the
 * loop is seamless. The second pass is hidden from assistive tech. Hovering
 * anywhere on the track pauses it — pure CSS, so this stays a Server Component.
 */
export function BrandMarquee() {
  return (
    <section id="brands" className="bg-surface py-14 lg:py-20">
      <Container>
        <p className="text-center text-eyebrow uppercase text-brass">
          Trusted partner brands
        </p>
      </Container>

      <div className="group marquee-mask mt-9 overflow-hidden">
        <ul className="flex w-max animate-marquee items-center group-hover:[animation-play-state:paused]">
          {brands.map((brand) => (
            <BrandItem key={brand.slug} name={brand.name} logo={brand.logo} />
          ))}
          {brands.map((brand) => (
            <BrandItem
              key={`${brand.slug}-duplicate`}
              name={brand.name}
              logo={brand.logo}
              aria-hidden
            />
          ))}
        </ul>
      </div>
    </section>
  );
}

function BrandItem({
  name,
  logo,
  'aria-hidden': ariaHidden,
}: {
  name: string;
  logo: string | null;
  'aria-hidden'?: boolean;
}) {
  return (
    <li
      aria-hidden={ariaHidden}
      className="flex h-12 shrink-0 items-center justify-center px-8 opacity-75 grayscale transition duration-300 ease-subtle hover:opacity-100 hover:grayscale-0 sm:px-12"
    >
      {logo ? (
        <Image
          src={logo}
          alt={`${name} logo`}
          width={160}
          height={48}
          className="h-8 w-auto object-contain sm:h-9"
        />
      ) : (
        <span className="whitespace-nowrap text-[1.0625rem] font-bold tracking-[-0.01em] text-ink sm:text-[1.1875rem]">
          {name}
        </span>
      )}
    </li>
  );
}
