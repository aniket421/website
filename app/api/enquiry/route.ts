import { NextResponse } from 'next/server';
import { enquirySchema, validateUpload } from '@/lib/validation/enquiry';

/** Text fields arrive as FormData so a reference file can ride along. */
const TEXT_FIELDS = [
  'fullName',
  'phone',
  'email',
  'city',
  'brand',
  'category',
  'message',
] as const;

export async function POST(request: Request) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, message: 'We could not read that enquiry. Please try again.' },
      { status: 400 },
    );
  }

  // Missing keys become empty strings so the schema sees a consistent shape.
  const candidate = Object.fromEntries(
    TEXT_FIELDS.map((field) => {
      const value = formData.get(field);
      return [field, typeof value === 'string' ? value : ''];
    }),
  );

  const parsed = enquirySchema.safeParse(candidate);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join('.');
      if (path && !fieldErrors[path]) fieldErrors[path] = issue.message;
    }

    return NextResponse.json(
      { ok: false, message: 'Some details need a second look.', fieldErrors },
      { status: 422 },
    );
  }

  const reference = formData.get('reference');

  if (reference instanceof File && reference.size > 0) {
    const uploadError = validateUpload(reference);
    if (uploadError) {
      return NextResponse.json(
        { ok: false, message: uploadError, fieldErrors: { reference: uploadError } },
        { status: 422 },
      );
    }
  }

  /*
   * TODO: persistence goes here. The validated enquiry in `parsed.data`, plus
   * the reference file if one was attached, should be written to the showroom's
   * store and pushed to the team — no database in this pass.
   */

  return NextResponse.json({ ok: true, message: 'Enquiry received.' }, { status: 200 });
}
