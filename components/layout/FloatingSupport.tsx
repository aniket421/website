import { Headset } from 'lucide-react';
import { site, whatsappUrl } from '@/lib/data/site';

/** Fixed brass circle, above every other layer, opening WhatsApp. */
export function FloatingSupport() {
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-5 z-[60] inline-flex h-14 w-14 items-center justify-center rounded-full bg-brass text-ink shadow-support transition-transform duration-200 ease-subtle hover:scale-105 lg:bottom-8 lg:right-8"
    >
      <Headset aria-hidden="true" className="h-6 w-6" />
      <span className="sr-only">
        Message the showroom on WhatsApp at {site.phone.display}
      </span>
    </a>
  );
}
