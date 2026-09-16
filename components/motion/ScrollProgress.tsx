'use client';

import { useEffect, useRef, useState } from 'react';
import { useScroll } from '@/lib/motion/hooks';

/**
 * The brass hairline under the header that fills as the page is read.
 *
 * Where the browser supports scroll-driven animations the bar is driven
 * entirely by CSS `animation-timeline: scroll()`, which the compositor runs
 * off the main thread — it stays perfectly in step with the scroll even while
 * JavaScript is busy. Everywhere else it falls back to the shared rAF loop,
 * which writes the same scaleX once per frame.
 */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const [native, setNative] = useState(true);

  useEffect(() => {
    setNative(
      typeof CSS !== 'undefined' && CSS.supports?.('animation-timeline: scroll()') === true,
    );
  }, []);

  useScroll(({ progress }) => {
    if (native) return;
    const node = ref.current;
    if (node) node.style.transform = `scaleX(${progress})`;
  });

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-px overflow-hidden"
    >
      <div
        ref={ref}
        data-native={native ? '' : undefined}
        className="scroll-progress h-full w-full origin-left bg-[linear-gradient(90deg,theme(colors.brass.deep),theme(colors.brass.DEFAULT),theme(colors.brass.soft))]"
      />
    </div>
  );
}
