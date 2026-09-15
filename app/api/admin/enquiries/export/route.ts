import { getEnquiriesForExport } from '@/lib/queries/admin';
import { getAdminSession } from '@/lib/admin-session';
import { serverError, unauthorized } from '@/lib/api/responses';
import { formatDateTime } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  'Reference', 'Received', 'Name', 'Phone', 'Email', 'City',
  'Brand', 'Category', 'Status', 'Source', 'Message', 'Internal notes', 'Attachment',
];

/**
 * A leading =, +, - or @ makes Excel and Sheets treat a cell as a formula, so a
 * name typed as "=cmd|..." becomes code on someone's desktop. Prefixing a
 * single quote neutralises it while still reading correctly in the sheet.
 */
function csvCell(value: string | null | undefined): string {
  const raw = value ?? '';
  const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  // Middleware gates /api/admin, and this checks again for itself.
  const session = await getAdminSession();
  if (!session) return unauthorized();

  const { searchParams } = new URL(request.url);

  try {
    const enquiries = await getEnquiriesForExport({
      status: searchParams.get('status') ?? undefined,
      brandId: searchParams.get('brandId') ?? undefined,
      categoryId: searchParams.get('categoryId') ?? undefined,
      from: searchParams.get('from') ?? undefined,
      to: searchParams.get('to') ?? undefined,
    });

    const rows = enquiries.map((e) =>
      [
        e.id,
        formatDateTime(e.createdAt),
        e.name,
        e.phone,
        e.email,
        e.city,
        e.brand?.name ?? '',
        e.category?.name ?? '',
        e.status,
        e.source,
        e.message,
        e.internalNotes,
        e.attachmentUrl,
      ]
        .map(csvCell)
        .join(','),
    );

    // BOM so Excel opens UTF-8 correctly; without it Indian names mangle.
    const csv = `﻿${COLUMNS.map(csvCell).join(',')}\r\n${rows.join('\r\n')}\r\n`;
    const stamp = new Date().toISOString().slice(0, 10);

    return new Response(csv, {
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="elegance-enquiries-${stamp}.csv"`,
        // Customer PII: never cached by a proxy or the browser.
        'cache-control': 'no-store, private',
      },
    });
  } catch (error) {
    return serverError('enquiries.export', error);
  }
}
