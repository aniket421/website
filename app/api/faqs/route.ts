import { getFaqs } from '@/lib/queries/catalogue';
import { ok, serverError } from '@/lib/api/responses';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return ok(await getFaqs());
  } catch (error) {
    return serverError('faqs.list', error);
  }
}
