'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Loader2, Maximize2, Minus, Plus, X } from 'lucide-react';
import { viewerUrl } from '@/lib/images';
import { useScrollLock } from '@/lib/motion/hooks';
import { cn } from '@/lib/utils';

export type ViewerImage = { url: string; altText: string | null };

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

/**
 * Full-screen image viewer, at the resolution the photograph was shot.
 *
 * The file it loads is requested straight from Cloudinary at up to 3840px and
 * `q_auto:best` — not the optimiser's card-sized derivative — because the
 * point of this screen is the surface of the tile: the grain of a stone
 * finish, where a carve catches light, whether a "matte" is really matte.
 *
 * Zoom and pan are written as one `transform` per frame, from refs. Holding
 * the pan in React state would schedule a render per pointer sample, and on a
 * 120Hz screen that is around 120 renders a second for a value only the
 * compositor needs.
 *
 * The whole thing is portalled to <body>. It has to be: a transform on any
 * ancestor — and every <Reveal> carries one while it animates — becomes the
 * containing block for `position: fixed` and opens a stacking context, which
 * would pin this overlay inside a card and slide it under the header. A
 * portal is the only placement that cannot be broken by a parent's styling.
 */
export function ProductViewer({
  images,
  index,
  onClose,
  onIndexChange,
  title,
}: {
  images: ViewerImage[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  title: string;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const frame = useRef(0);

  const zoom = useRef(MIN_ZOOM);
  const pan = useRef({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  const [zoomLabel, setZoomLabel] = useState(MIN_ZOOM);
  const [loading, setLoading] = useState(true);
  // document.body does not exist during the server render.
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useScrollLock(true);

  const current = images[index];

  const paint = useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const node = imageRef.current;
      if (!node) return;
      node.style.transform = `translate3d(${pan.current.x}px, ${pan.current.y}px, 0) scale(${zoom.current})`;
    });
  }, []);

  const setZoom = useCallback(
    (next: number) => {
      const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(next.toFixed(2))));
      zoom.current = clamped;
      if (clamped === MIN_ZOOM) pan.current = { x: 0, y: 0 };
      setZoomLabel(clamped);
      paint();
    },
    [paint],
  );

  /** Resets everything when the viewer moves to a different photograph. */
  const reset = useCallback(() => {
    zoom.current = MIN_ZOOM;
    pan.current = { x: 0, y: 0 };
    setZoomLabel(MIN_ZOOM);
    setLoading(true);
    paint();
  }, [paint]);

  const step = useCallback(
    (direction: 1 | -1) => {
      if (images.length < 2) return;
      reset();
      onIndexChange((index + direction + images.length) % images.length);
    },
    [images.length, index, onIndexChange, reset],
  );

  /*
   * Keyed to `mounted`: the portal has not rendered on the first pass, so the
   * close button does not exist yet and a focus() here would go nowhere,
   * leaving the keyboard stranded on the page behind the overlay.
   */
  useEffect(() => {
    if (mounted) closeRef.current?.focus();
  }, [mounted]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowRight':
          step(1);
          break;
        case 'ArrowLeft':
          step(-1);
          break;
        case '+':
        case '=':
          setZoom(zoom.current + 0.5);
          break;
        case '-':
          setZoom(zoom.current - 0.5);
          break;
        default:
          break;
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      cancelAnimationFrame(frame.current);
    };
  }, [onClose, step, setZoom]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (zoom.current === MIN_ZOOM) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      x: event.clientX,
      y: event.clientY,
      panX: pan.current.x,
      panY: pan.current.y,
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = drag.current;
    if (!start) return;
    pan.current = {
      x: start.panX + (event.clientX - start.x),
      y: start.panY + (event.clientY - start.y),
    };
    paint();
  };

  const onPointerUp = () => {
    drag.current = null;
  };

  if (!current || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — full resolution viewer`}
      /*
       * Opaque, not 96%: the header behind is white with a backdrop blur, and
       * even four percent of that reads as a grey ghost of the navigation
       * across the top of a photograph someone is inspecting closely.
       */
      className="animate-fade-in fixed inset-0 z-[80] flex flex-col bg-[#0C0C0C]"
    >
      <div className="on-dark flex items-center justify-between gap-4 px-4 py-4 lg:px-8">
        <div className="min-w-0">
          <p className="truncate text-[0.95rem] font-bold text-surface">{title}</p>
          <p className="mt-0.5 text-[0.8125rem] text-surface/60">
            {images.length > 1 ? `Image ${index + 1} of ${images.length} · ` : ''}
            Full resolution, up to 4K
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ZoomButton
            label="Zoom out"
            disabled={zoomLabel <= MIN_ZOOM}
            onClick={() => setZoom(zoom.current - 0.5)}
          >
            <Minus aria-hidden="true" className="h-4 w-4" />
          </ZoomButton>
          <span className="w-12 text-center text-[0.8125rem] font-semibold tabular-nums text-surface/80">
            {Math.round(zoomLabel * 100)}%
          </span>
          <ZoomButton
            label="Zoom in"
            disabled={zoomLabel >= MAX_ZOOM}
            onClick={() => setZoom(zoom.current + 0.5)}
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
          </ZoomButton>
          <ZoomButton buttonRef={closeRef} label="Close the viewer" onClick={onClose}>
            <X aria-hidden="true" className="h-4 w-4" />
          </ZoomButton>
        </div>
      </div>

      <div
        ref={stageRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={() => setZoom(zoom.current >= MAX_ZOOM ? MIN_ZOOM : zoom.current + 1)}
        className={cn(
          'relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-4 lg:px-10',
          zoomLabel > MIN_ZOOM ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in',
        )}
      >
        {loading ? (
          <Loader2
            aria-hidden="true"
            className="absolute h-8 w-8 animate-spin text-brass"
            strokeWidth={1.5}
          />
        ) : null}

        {/*
          A plain <img>, deliberately: next/image would re-encode this through
          the optimiser at a capped width, which is the one thing this screen
          exists to avoid. The card the reader clicked already loaded an
          optimised derivative, so this is the only full-size fetch on the page.
        */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imageRef}
          key={current.url}
          src={viewerUrl(current.url)}
          alt={current.altText ?? title}
          onLoad={() => setLoading(false)}
          draggable={false}
          className={cn(
            'max-h-full max-w-full select-none object-contain transition-[opacity] duration-500',
            loading ? 'opacity-0' : 'opacity-100',
          )}
          style={{ transformOrigin: 'center center' }}
        />

        {images.length > 1 ? (
          <>
            <StageButton label="Previous image" side="left" onClick={() => step(-1)}>
              <ChevronLeft aria-hidden="true" className="h-5 w-5" />
            </StageButton>
            <StageButton label="Next image" side="right" onClick={() => step(1)}>
              <ChevronRight aria-hidden="true" className="h-5 w-5" />
            </StageButton>
          </>
        ) : null}
      </div>

      <p className="on-dark pb-5 text-center text-[0.8125rem] text-surface/55">
        <Maximize2 aria-hidden="true" className="mr-1.5 inline h-3.5 w-3.5" />
        Double-click to zoom, drag to pan, Esc to close
      </p>
    </div>,
    document.body,
  );
}

/* `ref` is reserved on a React 18 function component, so the close button's
   node is handed over under its own prop name. */
function ZoomButton({
  buttonRef,
  label,
  disabled,
  onClick,
  children,
}: {
  buttonRef?: React.Ref<HTMLButtonElement>;
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-surface/20 text-surface transition-colors duration-200 hover:border-brass hover:text-brass disabled:cursor-not-allowed disabled:opacity-35"
    >
      {children}
    </button>
  );
}

function StageButton({
  label,
  side,
  onClick,
  children,
}: {
  label: string;
  side: 'left' | 'right';
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'absolute top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full',
        'glass-dark border border-surface/20 text-surface transition-transform duration-300 ease-spring hover:scale-110',
        side === 'left' ? 'left-3 lg:left-6' : 'right-3 lg:right-6',
      )}
    >
      {children}
    </button>
  );
}
