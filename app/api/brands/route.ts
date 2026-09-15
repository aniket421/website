import { getBrands } from '@/lib/queries/catalogue';
import { ok, serverError } from '@/lib/api/responses';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const brands = await getBrands();
    return ok(
      brands.map(({ _count, ...brand }) => ({ ...brand, productCount: _count.products })),
    );
  } catch (error) {
    return serverError('brands.list', error);
  }
}
