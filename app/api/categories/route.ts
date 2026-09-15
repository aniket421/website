import { getCategories } from '@/lib/queries/catalogue';
import { ok, serverError } from '@/lib/api/responses';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await getCategories();
    return ok(
      categories.map(({ _count, ...category }) => ({
        ...category,
        productCount: _count.products,
      })),
    );
  } catch (error) {
    return serverError('categories.list', error);
  }
}
