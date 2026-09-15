'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-session';
import { enquiryUpdateSchema } from '@/lib/validations/enquiry';

export type UpdateState = { error: string | null; saved: boolean };

/**
 * Update an enquiry's status and internal notes.
 *
 * Re-checks the session even though middleware ran (BACKEND.md §6, §8): a
 * server action is a public POST endpoint, and the only thing standing between
 * it and the internet is this check.
 */
export async function updateEnquiry(
  _prev: UpdateState,
  formData: FormData,
): Promise<UpdateState> {
  const session = await getAdminSession();
  if (!session) return { error: 'Your session has expired. Please sign in again.', saved: false };

  const id = String(formData.get('id') ?? '');
  if (!id) return { error: 'That enquiry could not be identified.', saved: false };

  const parsed = enquiryUpdateSchema.safeParse({
    status: formData.get('status') || undefined,
    internalNotes: formData.get('internalNotes') ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Those changes are not valid.', saved: false };
  }

  try {
    await prisma.enquiry.update({
      where: { id },
      data: {
        ...(parsed.data.status ? { status: parsed.data.status } : {}),
        ...(parsed.data.internalNotes !== undefined
          ? { internalNotes: parsed.data.internalNotes || null }
          : {}),
      },
    });
  } catch (error) {
    console.error('[enquiry.update]', { id, error });
    return { error: 'We could not save that. Please try again.', saved: false };
  }

  revalidatePath('/admin/enquiries');
  revalidatePath(`/admin/enquiries/${id}`);
  revalidatePath('/admin');

  return { error: null, saved: true };
}
