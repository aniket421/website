export type ClassValue = string | false | null | undefined;

/** Joins conditional class names. Keeps component markup readable. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ');
}
