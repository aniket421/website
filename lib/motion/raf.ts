/**
 * One scroll listener and one animation frame for the whole page.
 *
 * Every scroll-reactive component on the site subscribes here instead of
 * registering its own listener. Scroll events can fire far more often than the
 * display refreshes, so work is coalesced into a single rAF callback: on a
 * 120Hz panel that is at most one pass per 8.3ms frame, whatever the input
 * device does, and the browser never runs two components' handlers in the same
 * frame from two separate event dispatches.
 *
 * The scroll position is read once, at the top of the frame, and handed to
 * subscribers as a number. Subscribers must not read layout themselves — doing
 * so after another subscriber has written a style forces a synchronous reflow
 * and is the usual reason a scroll effect drops frames.
 */

export type ScrollState = {
  /** window.scrollY at the top of this frame. */
  y: number;
  /** Scrolled fraction of the document, 0 to 1. */
  progress: number;
};

type Subscriber = (state: ScrollState) => void;

const subscribers = new Set<Subscriber>();
let frame = 0;
let listening = false;

function measure(): ScrollState {
  const y = window.scrollY;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  return { y, progress: scrollable > 0 ? Math.min(1, Math.max(0, y / scrollable)) : 0 };
}

function flush() {
  frame = 0;
  const state = measure();
  for (const subscriber of subscribers) subscriber(state);
}

function schedule() {
  if (frame) return;
  frame = requestAnimationFrame(flush);
}

/**
 * Calls `subscriber` once immediately, then at most once per frame while the
 * page scrolls or resizes. Returns the unsubscribe function.
 */
export function subscribeScroll(subscriber: Subscriber): () => void {
  subscribers.add(subscriber);
  subscriber(measure());

  if (!listening) {
    listening = true;
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
  }

  return () => {
    subscribers.delete(subscriber);
    if (subscribers.size > 0) return;

    listening = false;
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  };
}
