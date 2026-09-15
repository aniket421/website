# Elegance Bath Decor — Backend Build Prompt

> Re-anchor long sessions with "re-read BACKEND.md". Frontend spec lives in
> [`PROMPT.md`](./PROMPT.md).

## 1. What this backend is for

Three jobs, in order of business value:

1. **Capture and route enquiries.** An enquiry that arrives but nobody sees is
   worse than no form at all. Storage plus notification, both, or neither
   counts.
2. **Let the showroom edit its own site.** Products, brands, testimonials, FAQs
   and gallery images change without a developer and without a deploy.
3. **Serve the catalogue.** Filterable product listings by brand, category,
   size and finish.

This is a single-showroom site with one or two admin users. It is not
multi-tenant, has no customer accounts, no cart, and no payments. Do not build
toward those. If a design decision is defensible only by "we might need it
later", skip it.

## 2. Stack

- Next.js 14 App Router — API handled by Route Handlers and Server Actions, no
  separate Express server
- PostgreSQL (Neon serverless) with Prisma ORM. SQLite locally is acceptable
  only if the schema stays Postgres-compatible — no SQLite-only types.
- Auth.js v5, credentials provider, bcrypt-hashed passwords
- Zod for every input boundary — the same schemas the frontend forms already
  use, imported from `lib/validations/`
- Cloudinary for image storage and transforms
- Resend for transactional email
- Upstash Redis for rate limiting

Nothing else without asking.

## 3. Data model

Write this as `prisma/schema.prisma`. Every model gets `id` (cuid),
`createdAt`, `updatedAt`.

**Brand** — name, slug (unique), logoUrl, description, websiteUrl,
displayOrder, isActive. Seed with the nine: Kajaria, AGL, Sunheart Ceramik,
Lioli Ceramica, Simero, Lavis Ceramic, Mozart, Ivash, Massimo.

**Category** — name, slug (unique), description, imageUrl, displayOrder,
isActive. Seed with the eight: Designer Tiles, Wall Tiles, Floor Tiles,
Sanitaryware, Faucets, Wash Basins, Large Slabs, Bathroom Accessories.

**Product** — name, slug (unique), brandId, categoryId, description, size
(e.g. "800×1600 mm"), finish (e.g. "Matte", "Glossy", "Carving"), application
(enum: FLOOR, WALL, BOTH, OUTDOOR), isFeatured, isActive, displayOrder. No
price field — showroom pricing is quoted, not published, and a stale price on a
website is a liability.

**ProductImage** — productId, url, altText, displayOrder, isPrimary. A separate
model, not a string array, so ordering and alt text survive.

**Enquiry** — name, phone, email (nullable), city (nullable), brandId
(nullable), categoryId (nullable), message, attachmentUrl (nullable), status
(enum: NEW, CONTACTED, QUOTED, CLOSED, SPAM, default NEW), internalNotes
(nullable), source (enum: WEBSITE_FORM, WHATSAPP, PHONE, WALK_IN — default
WEBSITE_FORM so offline enquiries can be logged too), createdAt indexed
descending.

**Testimonial** — authorName, city, quote, rating (1–5), source (default
"Google Review"), isPublished, displayOrder.

**Faq** — question, answer, displayOrder, isPublished.

**GalleryImage** — url, caption, altText, categoryId (nullable), displayOrder,
isPublished.

**AdminUser** — email (unique), passwordHash, name, role (enum: OWNER, STAFF),
lastLoginAt.

Relations: Brand and Category both have many Products and many Enquiries.
Product has many ProductImages with cascade delete. Enquiry references Brand
and Category with `onDelete: SetNull` — never lose an enquiry because a brand
was removed.

## 4. Public API

All under `app/api/`. Every handler validates input with Zod and returns a
consistent shape: `{ data }` on success, `{ error: { message, fields? } }` on
failure. Never leak Prisma errors to the client.

| Route | Method | Notes |
| --- | --- | --- |
| `/api/enquiry` | POST | The critical path — see §5 |
| `/api/products` | GET | Query params: brand, category, application, finish, search, page, limit (default 12, max 48). Returns items plus `{ total, page, totalPages }`. Only isActive. |
| `/api/products/[slug]` | GET | Includes brand, category and ordered images. 404 if inactive. |
| `/api/brands` | GET | Active only, with product counts |
| `/api/categories` | GET | Active only, with product counts |
| `/api/testimonials` | GET | Published only, ordered |
| `/api/faqs` | GET | Published only, ordered |

Prefer fetching directly in Server Components via a `lib/queries/` layer for
anything rendered server-side. The routes above exist for client-side filtering
and for the frontend that already expects them — don't round-trip through HTTP
when the page is server-rendered anyway.

## 5. The enquiry path

This is the one flow that must not fail quietly.

1. Validate with the shared Zod schema. Name and phone required; phone must
   match an Indian mobile format; email checked only if present.
2. **Honeypot**: a hidden field the form leaves empty. If filled, return 200 as
   though it succeeded and store nothing.
3. **Rate limit by IP**: 3 submissions per 10 minutes, 10 per day. Exceeding it
   returns 429 with a message pointing to the phone number.
4. **Persist the Enquiry first.** Notifications come after, and a notification
   failure must never lose the record or fail the request.
5. Send email via Resend to the showroom inbox with every field, the attachment
   link, and a `mailto:`/`tel:` line so the team can reply in one tap. Wrap in
   try/catch; log failures, still return success.
6. Return a success response the frontend turns into the confirmation state.

**WhatsApp**: the Meta Cloud API requires business verification and an approved
template, which takes days. Do not block this build on it. Ship email
notification now; leave a `lib/notifications/whatsapp.ts` stub with a clear
TODO describing the template payload. The public-facing WhatsApp button stays a
plain `wa.me` link and needs no backend.

**Attachments**: upload to Cloudinary client-side with a signed upload from
`/api/upload/sign`, then post the resulting URL with the form. Accept JPG, PNG,
PDF only, 10 MB max, validated on both sides. Never proxy file bytes through
your own route handler.

## 6. Admin

Routes under `app/admin/`, APIs under `app/api/admin/`. Both protected by
middleware that checks the Auth.js session and redirects unauthenticated users
to `/admin/login`. Never rely on hiding UI as the protection.

- **Login** — email and password, bcrypt-compared, httpOnly secure session
  cookie, 8-hour expiry. Rate-limit login attempts at 5 per 15 minutes per IP.
  Generic error text on failure; never reveal whether the email exists.
- **Dashboard** — new enquiry count, enquiries this week, total active
  products, and the five most recent enquiries.
- **Enquiries** — table with filters on status, brand, category and date range.
  Row detail shows everything plus `tel:` and `wa.me` links. Editable status
  and internal notes. CSV export.
- **Products** — list with search and filters, create/edit form, multi-image
  upload with drag-to-reorder, active toggle. Slug auto-generated from the
  name, editable, uniqueness enforced.
- **Brands, Categories, Testimonials, FAQs, Gallery** — straightforward CRUD
  with reorder and publish toggles.

Deletes are soft wherever the record may be referenced — set
`isActive`/`isPublished` false. Hard-delete only ProductImages and
GalleryImages.

Seed one OWNER account from environment variables via `prisma/seed.ts`. The
seed script must be idempotent.

## 7. Environment

```
DATABASE_URL=
DIRECT_URL=                    # Neon pooled vs direct for migrations
AUTH_SECRET=
AUTH_URL=
ADMIN_SEED_EMAIL=
ADMIN_SEED_PASSWORD=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RESEND_API_KEY=
ENQUIRY_NOTIFY_EMAIL=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Commit `.env.example` with these keys and empty values. Never commit `.env`.
Validate every variable at startup in `lib/env.ts` with Zod so a missing key
fails loudly at boot, not silently at 2am when an enquiry arrives.

## 8. Security floor

- Zod validation on every route handler and server action, without exception
- Passwords bcrypt-hashed at cost 12; no password ever logged or returned
- No raw SQL string interpolation; Prisma parameterizes, keep it that way
- Admin API routes re-check the session server-side even though middleware ran
- Enquiry data is customer PII: never logged in full, never sent to a third
  party beyond the notification email
- Generic error messages to clients; detailed errors to server logs only
- `next.config` security headers: HSTS, X-Frame-Options DENY,
  X-Content-Type-Options nosniff, a sensible CSP

## 9. Build order

Stop for review at each checkpoint.

1. Prisma schema, migration, seed script for brands, categories, an admin user,
   and a handful of sample products. **Checkpoint — show me the schema before
   migrating.**
2. Env validation, Prisma client singleton, shared Zod schemas, error response
   helpers.
3. Enquiry endpoint end to end: validation, honeypot, rate limit, persistence,
   email. Wire the existing frontend form to it. **Checkpoint — this is the one
   that earns money.**
4. Public read APIs and the `lib/queries/` layer; connect the category rail,
   brands and testimonials to real data.
5. Auth: login page, middleware, session handling.
6. Admin enquiries screen — list, filters, detail, status, notes, CSV.
   **Checkpoint.**
7. Admin products with Cloudinary upload and reordering.
8. Remaining admin CRUD.
9. Hardening: headers, rate limits verified, error states, a README covering
   local setup, migrations and deploy.

## 10. How to work

- State your assumption before each step, then build.
- Migrations are additive and named meaningfully. Never `prisma db push`
  against anything but local.
- Every route handler needs its unhappy paths handled: invalid input, not
  found, unauthorized, rate limited, database unreachable.
- If a requirement here conflicts with your instinct, follow this document and
  say so.
- Ask one question rather than guessing across several files.
