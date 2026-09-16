/**
 * Delay for the nth item in a revealing list.
 *
 * Deliberately not exported from components/motion/Reveal.tsx: that module is
 * a Client Component, and every export of one becomes a client reference. A
 * Server Component importing this from there would be calling a stub, not a
 * function.
 *
 * The cascade is capped so a long grid never leaves its last card waiting
 * seconds for a turn that the reader has already scrolled past.
 */
export function stagger(index: number, step = 70, cap = 8): number {
  return Math.min(index, cap) * step;
}
