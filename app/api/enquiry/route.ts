import { prisma } from '@/lib/prisma';
import { enquirySchema, toE164 } from '@/lib/validations/enquiry';
import { clientIp, limitEnquiry } from '@/lib/rate-limit';
import { sendEnquiryNotification } from '@/lib/notifications/email';
import { maskPhone } from '@/lib/api/logging';
import { badRequest, ok, serverError, tooManyRequests, validationFailed } from '@/lib/api/responses';
import { site } from '@/lib/data/site';

/** Reads request headers and the database; never prerendered. */
export const dynamic = 'force-dynamic';

/** Persist first, notify second. A notification failure never loses a record. */

const SUCCESS = {
  message: 'Enquiry received.',
  detail: 'A consultant will call you within 24 hours, during showroom hours.',
};

export async function POST(request: Request) {
  let payload: unknown;

  try {
    const contentType = request.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      payload = await request.json();
    } else {
      // Attachments go straight to Cloudinary, so the body is only ever fields.
      payload = Object.fromEntries(await request.formData());
    }
  } catch {
    return badRequest('We could not read that enquiry. Please try again.');
  }

  const parsed = enquirySchema.safeParse(payload);
  if (!parsed.success) return validationFailed(parsed.error);

  const enquiry = parsed.data;

  /*
   * Honeypot. A real person never sees this field, so anything in it is a bot.
   * Return the success shape and store nothing: telling a bot it was caught
   * only teaches whoever wrote it to stop filling the field in.
   */
  if (enquiry.companyWebsite.trim() !== '') {
    return ok(SUCCESS);
  }

  const ip = clientIp(request);
  const limit = await limitEnquiry(ip);
  if (!limit.success) {
    return tooManyRequests(
      `That is a few enquiries in a short time. Please call us on ${site.phone.display} and we will take the details straight away.`,
      limit.retryAfter,
    );
  }

  try {
    /*
     * Referenced brand and category must exist and be active, or the enquiry
     * would carry a dangling id. An unknown id is dropped rather than rejected:
     * a stale dropdown is our problem, not a reason to lose the enquiry.
     */
    const [brand, category] = await Promise.all([
      enquiry.brandId
        ? prisma.brand.findFirst({ where: { id: enquiry.brandId, isActive: true } })
        : null,
      enquiry.categoryId
        ? prisma.category.findFirst({ where: { id: enquiry.categoryId, isActive: true } })
        : null,
    ]);

    const record = await prisma.enquiry.create({
      data: {
        name: enquiry.fullName,
        phone: toE164(enquiry.phone),
        email: enquiry.email || null,
        city: enquiry.city || null,
        brandId: brand?.id ?? null,
        categoryId: category?.id ?? null,
        message: enquiry.message,
        attachmentUrl: enquiry.attachmentUrl || null,
        source: 'WEBSITE_FORM',
      },
    });

    // PII stays out of the log: an id and a masked number, nothing more.
    console.info(`[enquiry] stored ${record.id} from ${maskPhone(record.phone)}`);

    // Awaited so a slow provider surfaces in logs, but its failure is absorbed.
    const emailed = await sendEnquiryNotification({
      id: record.id,
      name: record.name,
      phone: record.phone,
      email: record.email,
      city: record.city,
      brandName: brand?.name ?? null,
      categoryName: category?.name ?? null,
      message: record.message,
      attachmentUrl: record.attachmentUrl,
      createdAt: record.createdAt,
    });

    if (!emailed) {
      console.error(
        `[enquiry] ${record.id} saved but NOT notified — check the admin enquiries screen`,
      );
    }

    return ok(SUCCESS);
  } catch (error) {
    return serverError('enquiry.create', error);
  }
}
