'use client';

import Link from 'next/link';
import { useFormState } from 'react-dom';
import { Checkbox, Field, FormError, Select, SubmitButton, TextArea, TextInput } from '@/components/admin/fields';
import { ImageManager, type ManagedImage } from '@/components/admin/ImageManager';
import type { ProductState } from './actions';

const APPLICATIONS = ['FLOOR', 'WALL', 'BOTH', 'OUTDOOR'] as const;
const initial: ProductState = { error: null, fields: {} };

export type ProductFormValues = {
  name: string;
  slug: string;
  brandId: string;
  categoryId: string;
  description: string;
  size: string;
  finish: string;
  application: string;
  isFeatured: boolean;
  isActive: boolean;
  displayOrder: number;
  images: ManagedImage[];
};

export function ProductForm({
  action,
  values,
  brands,
  categories,
}: {
  action: (prev: ProductState, formData: FormData) => Promise<ProductState>;
  values: ProductFormValues;
  brands: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}) {
  const [state, formAction] = useFormState(action, initial);
  const err = (key: string) => state.fields[key];

  return (
    <form action={formAction} className="space-y-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Name" error={err('name')}>
          <TextInput id="name" name="name" error={err('name')} defaultValue={values.name} required />
        </Field>

        <Field
          id="slug"
          label="Slug"
          hint="Leave blank to build it from the name."
          error={err('slug')}
        >
          <TextInput id="slug" name="slug" error={err('slug')} defaultValue={values.slug} placeholder="statuario-bookmatch-slab" />
        </Field>

        <Field id="brandId" label="Brand" error={err('brandId')}>
          <Select id="brandId" name="brandId" error={err('brandId')} defaultValue={values.brandId} required>
            <option value="">Choose a brand</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </Select>
        </Field>

        <Field id="categoryId" label="Category" error={err('categoryId')}>
          <Select id="categoryId" name="categoryId" error={err('categoryId')} defaultValue={values.categoryId} required>
            <option value="">Choose a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </Field>

        <Field id="size" label="Size" hint='For example "800×1600 mm".' error={err('size')}>
          <TextInput id="size" name="size" error={err('size')} defaultValue={values.size} />
        </Field>

        <Field id="finish" label="Finish" hint='For example "Matte", "Glossy", "Carving".' error={err('finish')}>
          <TextInput id="finish" name="finish" error={err('finish')} defaultValue={values.finish} />
        </Field>

        <Field id="application" label="Application" error={err('application')}>
          <Select id="application" name="application" error={err('application')} defaultValue={values.application}>
            {APPLICATIONS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </Select>
        </Field>

        <Field id="displayOrder" label="Display order" hint="Lower numbers appear first." error={err('displayOrder')}>
          <TextInput id="displayOrder" name="displayOrder" type="number" min={0} error={err('displayOrder')} defaultValue={values.displayOrder} />
        </Field>
      </div>

      <Field id="description" label="Description" error={err('description')}>
        <TextArea id="description" name="description" rows={4} error={err('description')} defaultValue={values.description} />
      </Field>

      <div>
        <h2 className="text-card text-ink">Images</h2>
        <div className="mt-3">
          <ImageManager name="images" purpose="product" initial={values.images} />
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <Checkbox id="isActive" name="isActive" label="Active" defaultChecked={values.isActive} />
        <Checkbox id="isFeatured" name="isFeatured" label="Featured" defaultChecked={values.isFeatured} />
      </div>

      <FormError message={state.error} />

      <div className="flex items-center gap-4">
        <SubmitButton>Save Product</SubmitButton>
        <Link href="/admin/products" className="text-[0.9375rem] font-semibold text-body">
          Cancel
        </Link>
      </div>
    </form>
  );
}
