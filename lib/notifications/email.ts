import { Resend } from 'resend';
import { env, isEmailConfigured } from '@/lib/env';
import { site, telUrl } from '@/lib/data/site';

/**
 * Enquiry notification. An enquiry nobody sees is worse than no form at all
 * (BACKEND.md §1), so this email carries every field, the attachment link, and
 * tel:/mailto:/wa.me lines so the team can reply in one tap.
 *
 * Never throws: the caller has already persisted the record, and a Resend
 * outage must not turn a saved enquiry into a failed request.
 */

const resend = isEmailConfigured ? new Resend(env.RESEND_API_KEY) : null;

export type EnquiryEmailInput = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  city: string | null;
  brandName: string | null;
  categoryName: string | null;
  message: string;
  attachmentUrl: string | null;
  createdAt: Date;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** Stored numbers are E.164 (+91XXXXXXXXXX); wa.me wants digits only. */
function digitsOnly(phone: string) {
  return phone.replace(/\D/g, '');
}

function buildHtml(enquiry: EnquiryEmailInput) {
  const rows: [string, string][] = [
    ['Name', enquiry.name],
    ['Phone', enquiry.phone],
    ['Email', enquiry.email || '—'],
    ['City', enquiry.city || '—'],
    ['Brand', enquiry.brandName || 'No preference'],
    ['Category', enquiry.categoryName || 'Not sure yet'],
    ['Received', enquiry.createdAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })],
  ];

  const table = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#6E6E6E;white-space:nowrap">${escapeHtml(label)}</td>` +
        `<td style="padding:6px 0;color:#1A1A1A"><strong>${escapeHtml(value)}</strong></td></tr>`,
    )
    .join('');

  const message = enquiry.message
    ? `<p style="margin:0 0 6px;color:#6E6E6E">Message</p>
       <p style="margin:0;padding:14px 16px;background:#F6F5F3;border-radius:10px;color:#1A1A1A;white-space:pre-wrap">${escapeHtml(
         enquiry.message,
       )}</p>`
    : '';

  const attachment = enquiry.attachmentUrl
    ? `<p style="margin:18px 0 0"><a href="${escapeHtml(
        enquiry.attachmentUrl,
      )}" style="color:#8A6520;font-weight:600">View the attached reference</a></p>`
    : '';

  const wa = `https://wa.me/${digitsOnly(enquiry.phone)}`;
  const mailto = enquiry.email ? `<a href="mailto:${escapeHtml(enquiry.email)}">Email</a> · ` : '';

  return `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:560px">
    <p style="margin:0 0 4px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#8A6520"><strong>New enquiry</strong></p>
    <h1 style="margin:0 0 18px;font-size:22px;color:#1A1A1A">${escapeHtml(enquiry.name)}</h1>
    <table style="border-collapse:collapse;font-size:14px;margin-bottom:18px">${table}</table>
    ${message}
    ${attachment}
    <p style="margin:22px 0 0;font-size:14px">
      <a href="tel:${escapeHtml(enquiry.phone)}">Call</a> ·
      <a href="${wa}">WhatsApp</a> ·
      ${mailto}
      <span style="color:#6E6E6E">ref ${escapeHtml(enquiry.id)}</span>
    </p>
  </div>`;
}

function buildText(enquiry: EnquiryEmailInput) {
  return [
    `New enquiry — ${enquiry.name}`,
    `Phone:    ${enquiry.phone}`,
    `Email:    ${enquiry.email || '—'}`,
    `City:     ${enquiry.city || '—'}`,
    `Brand:    ${enquiry.brandName || 'No preference'}`,
    `Category: ${enquiry.categoryName || 'Not sure yet'}`,
    '',
    enquiry.message || '(no message)',
    '',
    enquiry.attachmentUrl ? `Attachment: ${enquiry.attachmentUrl}` : '',
    `Call: ${telUrl}  |  WhatsApp: https://wa.me/${digitsOnly(enquiry.phone)}`,
    `Ref: ${enquiry.id}`,
  ]
    .filter(Boolean)
    .join('\n');
}

export async function sendEnquiryNotification(enquiry: EnquiryEmailInput): Promise<boolean> {
  if (!resend) {
    // Development without Resend: show that the notification would have gone,
    // without printing the customer's details into a log.
    console.warn(
      `[email] Resend not configured — enquiry ${enquiry.id} stored but not emailed. ` +
        'Production refuses to boot without RESEND_API_KEY.',
    );
    return false;
  }

  try {
    const result = await resend.emails.send({
      from: `${site.name} <enquiries@${new URL(site.url).hostname.replace(/^www\./, '')}>`,
      to: [env.ENQUIRY_NOTIFY_EMAIL],
      replyTo: enquiry.email || undefined,
      subject: `New enquiry — ${enquiry.name}${enquiry.city ? `, ${enquiry.city}` : ''}`,
      html: buildHtml(enquiry),
      text: buildText(enquiry),
    });

    if (result.error) {
      console.error('[email] Resend rejected enquiry notification', {
        enquiryId: enquiry.id,
        error: result.error,
      });
      return false;
    }
    return true;
  } catch (error) {
    console.error('[email] enquiry notification failed', { enquiryId: enquiry.id, error });
    return false;
  }
}
