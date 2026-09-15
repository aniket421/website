/**
 * Enquiry records are customer PII (BACKEND.md §8). Nothing here may log a
 * full phone number, email address or message body — only enough to trace a
 * record back to its row.
 */

/** "9873255836" -> "98•••••836". Enough to recognise, not enough to use. */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 6) return '•'.repeat(digits.length);
  return `${digits.slice(0, 2)}${'•'.repeat(digits.length - 5)}${digits.slice(-3)}`;
}

/** "ritu@example.com" -> "r•••@example.com". */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '•••';
  return `${local.slice(0, 1)}${'•'.repeat(Math.max(local.length - 1, 1))}@${domain}`;
}
