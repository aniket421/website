import { getCategories } from '@/lib/queries/catalogue';
import { CategoryRailClient } from '@/components/sections/CategoryRailClient';

export async function CategoryRail() {
  const categories = await getCategories();
  if (categories.length === 0) return null;

  return <CategoryRailClient categories={categories} />;
}
