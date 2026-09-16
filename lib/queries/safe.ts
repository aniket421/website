/**
 * A database that is unreachable should cost the showroom a product grid, not
 * the whole page.
 *
 * Every public page reads its content through here. If the query throws — the
 * connection is down, the migration has not run yet, the build machine has no
 * DATABASE_URL — the section falls back to the copy held in lib/data/ and the
 * page still renders, still ranks, and still takes an enquiry. The failure is
 * logged once, with the query's name, so it is visible in the server log
 * rather than silently swallowed.
 */
export async function safeQuery<T>(name: string, run: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await run();
  } catch (error) {
    console.error(`[query:${name}] falling back to static content`, error);
    return fallback;
  }
}
