import type { EnquiryEmailInput } from './email';

/**
 * WhatsApp notification — deliberately a stub.
 *
 * The Meta Cloud API needs a verified business and an approved message
 * template, which takes days (BACKEND.md §5). Email notification ships now and
 * this slots in behind the same call site when the approval lands.
 *
 * Note this is only for notifying the SHOWROOM. The public-facing WhatsApp
 * button is a plain wa.me link and needs no backend at all.
 *
 * TODO: once the business is verified and a template is approved, POST to
 *   https://graph.facebook.com/v21.0/<PHONE_NUMBER_ID>/messages
 *   Authorization: Bearer <WHATSAPP_ACCESS_TOKEN>
 *   {
 *     "messaging_product": "whatsapp",
 *     "to": "<showroom number, digits only, country code first>",
 *     "type": "template",
 *     "template": {
 *       "name": "new_enquiry",           // submitted for approval in Meta Business Manager
 *       "language": { "code": "en" },
 *       "components": [{
 *         "type": "body",
 *         "parameters": [
 *           { "type": "text", "text": "<customer name>" },
 *           { "type": "text", "text": "<customer phone>" },
 *           { "type": "text", "text": "<category or 'Not sure yet'>" }
 *         ]
 *       }]
 *     }
 *   }
 * Add WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN to lib/env.ts as
 * deployRequired at that point, not before.
 *
 * Template parameters must stay free of newlines and tabs or Meta rejects the
 * send, so the message body is never passed through — only name, phone and
 * category, with the detail left to the email and the admin screen.
 */
export async function sendEnquiryWhatsApp(enquiry: EnquiryEmailInput): Promise<boolean> {
  void enquiry;
  return false;
}
