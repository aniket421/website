'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Send, X } from 'lucide-react';
import { site } from '@/lib/data/site';
import { cn } from '@/lib/utils';

/** Brand glyph — lucide has no WhatsApp mark, so it is drawn here. */
function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.23 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.35-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.87.85-.87 2.07s.9 2.4 1.02 2.57c.12.16 1.76 2.67 4.25 3.75.6.25 1.06.4 1.42.52.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.11-.22-.17-.47-.29Z" />
    </svg>
  );
}

/** The openers the floor actually gets asked, as one-tap chips. */
const QUICK_REPLIES = [
  'I would like prices for a range I saw.',
  'Is this size in stock right now?',
  'I would like to book a showroom visit.',
  'I need project rates for a bulk order.',
] as const;

/**
 * Is the showroom open, in showroom time?
 *
 * Read on the client only. The server has no idea what hour it is in Ghaziabad
 * relative to the reader, and rendering "Open now" on the server would hand
 * React two different answers to hydrate.
 */
function useOpenNow(): boolean | null {
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => {
      const now = new Date();
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata',
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).formatToParts(now);

      const weekday = parts.find((part) => part.type === 'weekday')?.value ?? '';
      const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? '0');
      const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? '0');
      const minutes = hour * 60 + minute;

      const today = site.openingHoursSpec.find((spec) =>
        (spec.days as readonly string[]).includes(weekday),
      );
      if (!today) {
        setOpen(false);
        return;
      }

      const toMinutes = (time: string) => {
        const [h, m] = time.split(':');
        return Number(h) * 60 + Number(m);
      };
      setOpen(minutes >= toMinutes(today.opens) && minutes < toMinutes(today.closes));
    };

    check();
    // Re-check on the minute boundary rather than every second.
    const timer = window.setInterval(check, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return open;
}

function waLink(message: string) {
  return `https://wa.me/${site.phone.whatsapp}?text=${encodeURIComponent(message)}`;
}

/**
 * The floating WhatsApp button and the card it opens.
 *
 * The card is not a chat client — it composes the first message and hands it
 * to WhatsApp, where the conversation actually lives. That is the honest
 * version: the reader sees exactly what will be sent, and the showroom answers
 * from the number they already use.
 */
export function WhatsAppWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [teaser, setTeaser] = useState(false);
  const openNow = useOpenNow();

  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // One nudge, eight seconds in, and never again once it has been dealt with.
  useEffect(() => {
    if (open) return;
    const timer = window.setTimeout(() => setTeaser(true), 8000);
    return () => window.clearTimeout(timer);
  }, [open]);

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    /*
     * preventScroll matters here: on a short window the card scrolls
     * internally, and a plain focus() would scroll the composer into view by
     * pushing the card's own heading — and its close button — off the top.
     */
    inputRef.current?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open, close]);

  const send = () => {
    const text = message.trim() || 'Hello Elegance Bath Decor, I would like some help choosing.';
    window.open(waLink(text), '_blank', 'noopener,noreferrer');
    setMessage('');
    setOpen(false);
  };

  const statusLabel =
    openNow === null
      ? 'Typically replies within minutes'
      : openNow
        ? 'Open now — replies within minutes'
        : 'Closed — we reply first thing tomorrow';

  return (
    <div className="fixed bottom-5 right-4 z-[60] flex flex-col items-end gap-3 lg:bottom-7 lg:right-7">
      {/* ------------------------------------------------------------ card */}
      <div
        ref={panelRef}
        id="whatsapp-panel"
        role="dialog"
        aria-modal="false"
        aria-label={`Message ${site.name} on WhatsApp`}
        aria-hidden={!open}
        className={cn(
          'w-[min(360px,calc(100vw-2rem))] origin-bottom-right rounded-panel border border-line bg-surface shadow-panel',
          // Never taller than the window: on a short laptop screen the card
          // would otherwise grow up past the header and lose its own close
          // button off the top.
          'max-h-[min(640px,calc(100svh-9rem))] overflow-y-auto',
          'transition-[opacity,transform] duration-500 ease-out-expo',
          open
            ? 'translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none translate-y-3 scale-95 opacity-0',
        )}
      >
        <div className="relative flex items-start gap-3 bg-footer px-5 py-4 text-surface">
          <span
            aria-hidden="true"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brass text-[0.95rem] font-extrabold text-ink"
          >
            EB
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[0.95rem] font-bold leading-tight">{site.name}</p>
            <p className="mt-1 flex items-center gap-1.5 text-[0.75rem] text-surface/75">
              <span
                aria-hidden="true"
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  openNow === false ? 'bg-surface/40' : 'bg-[#25D366]',
                )}
              />
              {statusLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            tabIndex={open ? undefined : -1}
            aria-label="Close the WhatsApp panel"
            className="on-dark -mr-1.5 -mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-surface/70 transition-colors hover:bg-surface/10 hover:text-surface"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>

        <div className="bg-surface-alt px-5 py-5">
          <div
            className={cn(
              'max-w-[86%] rounded-card rounded-tl-sm bg-surface px-4 py-3 shadow-[0_8px_24px_-18px_rgba(26,26,26,0.5)]',
              open && 'animate-rise-in',
            )}
          >
            <p className="text-[0.875rem] leading-[1.6] text-ink">
              Namaste. Tell us what you are looking for and a consultant on the floor
              will pick it up — sizes, stock and a price, on WhatsApp.
            </p>
          </div>

          <p className="mt-4 text-[0.75rem] font-bold uppercase tracking-[0.12em] text-brass-deep">
            Start with
          </p>
          <ul className="mt-2.5 flex flex-wrap gap-2">
            {QUICK_REPLIES.map((reply, index) => (
              <li key={reply}>
                <button
                  type="button"
                  tabIndex={open ? undefined : -1}
                  onClick={() => {
                    setMessage(reply);
                    inputRef.current?.focus({ preventScroll: true });
                  }}
                  style={{ transitionDelay: open ? `${120 + index * 45}ms` : '0ms' }}
                  className={cn(
                    'rounded-full border border-line bg-surface px-3.5 py-2 text-left text-[0.8125rem] text-body',
                    'transition-[opacity,transform,border-color,background-color] duration-500 ease-out-expo',
                    'hover:border-brass hover:bg-brass-tint hover:text-ink',
                    open ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
                  )}
                >
                  {reply}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-line bg-surface p-4">
          <label htmlFor="whatsapp-message" className="sr-only">
            Your message
          </label>
          <textarea
            id="whatsapp-message"
            ref={inputRef}
            rows={2}
            value={message}
            tabIndex={open ? undefined : -1}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              // Enter sends, Shift+Enter breaks the line — the WhatsApp habit.
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                send();
              }
            }}
            placeholder="Type your message…"
            className="block w-full resize-none rounded-sm border border-line bg-surface px-3.5 py-2.5 text-[0.875rem] text-ink placeholder:text-body transition-colors duration-200 hover:border-brass"
          />
          <button
            type="button"
            onClick={send}
            tabIndex={open ? undefined : -1}
            className="group mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] text-[0.9375rem] font-bold text-[#0B2E13] transition-transform duration-300 ease-spring hover:scale-[1.02]"
          >
            Send on WhatsApp
            <Send
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-400 ease-spring group-hover:translate-x-0.5"
            />
          </button>
          <p className="mt-2.5 text-center text-[0.75rem]">
            Opens WhatsApp with your message ready to send.
          </p>
        </div>
      </div>

      {/* ---------------------------------------------------------- teaser */}
      <div
        aria-hidden="true"
        className={cn(
          'flex items-center gap-1 rounded-full border border-line bg-surface py-2 pl-4 pr-2 text-[0.8125rem] font-semibold text-ink shadow-panel',
          'transition-[opacity,transform] duration-600 ease-out-expo',
          teaser && !open ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
        )}
      >
        Need help choosing?
        <button
          type="button"
          onClick={() => setTeaser(false)}
          tabIndex={-1}
          className="inline-flex h-6 w-6 items-center justify-center rounded-full text-body transition-colors hover:bg-surface-alt hover:text-ink"
        >
          <X aria-hidden="true" className="h-3.5 w-3.5" />
          <span className="sr-only">Dismiss</span>
        </button>
      </div>

      {/* ---------------------------------------------------------- button */}
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="whatsapp-panel"
        onClick={() => {
          setTeaser(false);
          setOpen((current) => !current);
        }}
        className="group relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-surface shadow-[0_14px_34px_-10px_rgba(37,211,102,0.75)] transition-transform duration-400 ease-spring hover:scale-110 active:scale-95"
      >
        {/* Halo. Purely decorative, and dropped entirely under reduced motion. */}
        <span
          aria-hidden="true"
          className={cn(
            'absolute inset-0 rounded-full bg-[#25D366]',
            open ? 'hidden' : 'animate-pulse-ring',
          )}
        />
        <span className="relative block h-7 w-7">
          <WhatsAppGlyph
            className={cn(
              'absolute inset-0 h-7 w-7 transition-[opacity,transform] duration-400 ease-spring',
              open ? 'rotate-90 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100',
            )}
          />
          <X
            aria-hidden="true"
            className={cn(
              'absolute inset-0 h-7 w-7 transition-[opacity,transform] duration-400 ease-spring',
              open ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-50 opacity-0',
            )}
          />
        </span>
        <span className="sr-only">
          {open
            ? 'Close the WhatsApp panel'
            : `Message the showroom on WhatsApp at ${site.phone.display}`}
        </span>
      </button>
    </div>
  );
}
