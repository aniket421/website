import { getProductBySlug } from '@/lib/queries/catalogue';
import { notFound, ok, serverError } from '@/lib/api/responses';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  try {
    const product = await getProductBySlug(params.slug);
    // Inactive products are indistinguishable from missing ones from out here.
    if (!product) return notFound('We could not find that product.');
    return ok(product);
  } catch (error) {
    return serverError('products.detail', error);
  }
}
