import { getProducts } from '@/lib/queries/catalogue';
import { productQuerySchema } from '@/lib/validations/catalogue';
import { ok, serverError, validationFailed } from '@/lib/api/responses';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Absent params fall through to the schema's defaults rather than becoming
  // empty strings, which would filter on "" and return nothing.
  const raw = Object.fromEntries(
    [...searchParams.entries()].filter(([, value]) => value !== ''),
  );

  const parsed = productQuerySchema.safeParse(raw);
  if (!parsed.success) return validationFailed(parsed.error, 'Those filters are not valid.');

  try {
    const result = await getProducts(parsed.data);
    return ok(result);
  } catch (error) {
    return serverError('products.list', error);
  }
}
