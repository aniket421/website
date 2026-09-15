'use server';

import {
  deleteGalleryImage,
  reorder,
  togglePublished,
} from './actions';

/**
 * Server actions cannot be passed to a Client Component partially applied with
 * a plain .bind in a "use server" module, so each model gets a named wrapper.
 */

export async function toggleBrand(id: string, next: boolean) {
  return togglePublished('brand', id, next);
}
export async function reorderBrands(ids: string[]) {
  return reorder('brand', ids);
}

export async function toggleCategory(id: string, next: boolean) {
  return togglePublished('category', id, next);
}
export async function reorderCategories(ids: string[]) {
  return reorder('category', ids);
}

export async function toggleTestimonial(id: string, next: boolean) {
  return togglePublished('testimonial', id, next);
}
export async function reorderTestimonials(ids: string[]) {
  return reorder('testimonial', ids);
}

export async function toggleFaq(id: string, next: boolean) {
  return togglePublished('faq', id, next);
}
export async function reorderFaqs(ids: string[]) {
  return reorder('faq', ids);
}

export async function toggleGalleryImage(id: string, next: boolean) {
  return togglePublished('galleryImage', id, next);
}
export async function reorderGalleryImages(ids: string[]) {
  return reorder('galleryImage', ids);
}
export async function removeGalleryImage(id: string) {
  return deleteGalleryImage(id);
}
