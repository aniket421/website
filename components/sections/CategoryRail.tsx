import { getCategories } from '@/lib/queries/catalogue';
import { safeQuery } from '@/lib/queries/safe';
import { CategoryRailClient } from '@/components/sections/CategoryRailClient';

export async function CategoryRail() {
  const categories = await safeQuery('railCategories', () => getCategories(), []);
  if (categories.length === 0) return null;

  return <CategoryRailClient categories={categories} />;
}
