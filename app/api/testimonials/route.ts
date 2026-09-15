import { getTestimonials } from '@/lib/queries/catalogue';
import { ok, serverError } from '@/lib/api/responses';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return ok(await getTestimonials());
  } catch (error) {
    return serverError('testimonials.list', error);
  }
}
