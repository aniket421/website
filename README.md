# Elegance Bath Decor

Marketing site and showroom admin for Elegance Bath Decor, a multi-brand tile
and bathware showroom in Ghaziabad, Uttar Pradesh.

The site's job is not e-commerce. It is to make the showroom feel worth the
drive, prove the brand roster is authentic, and produce qualified enquiries — a
phone call, a WhatsApp message, or a completed enquiry form.

Two documents define the build and take precedence over anything here:
[`PROMPT.md`](./PROMPT.md) for the frontend, [`BACKEND.md`](./BACKEND.md) for
this layer.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 14, App Router, TypeScript strict |
| Database | PostgreSQL (Neon) via Prisma |
| Auth | Auth.js v5, credentials, bcrypt |
| Validation | Zod, shared between client and server |
| Images | Cloudinary, uploaded direct from the browser |
| Email | Resend |
| Rate limiting | Upstash Redis |
| Styling | Tailwind, tokens in `tailwind.config.ts` |

## Local setup

Requires Node 20+ and a PostgreSQL 14+ server.

```bash
npm install
cp .env.example .env        # then fill it in — see below
npm run db:migrate          # applies migrations to your local database
npm run db:seed             # brands, categories, sample products, admin user
npm run dev
```

The site is at `http://localhost:3000`, the admin at `/admin/login`. Sign in
with the `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD` you set, then change the
password.

### A local Postgres in one command

```bash
initdb -D .pgdata -U postgres
pg_ctl -D .pgdata -o "-p 5433" -l .pgdata/log start
createdb -h localhost -p 5433 -U postgres elegance
```

Then set both URLs to
`postgresql://postgres@localhost:5433/elegance?schema=public`.

### Environment

`lib/env.ts` validates everything at boot with Zod, so a missing key fails
loudly rather than silently at 2am when an enquiry arrives.

`DATABASE_URL`, `DIRECT_URL` and `AUTH_SECRET` are required in every
environment. The integration keys — Cloudinary, Resend, Upstash — are required
**in production** and optional in development, where their absence logs a
warning at boot and puts that subsystem into a documented degraded mode:

| Missing | Development behaviour |
| --- | --- |
| Cloudinary | Upload signing returns 503; the form says to send the file by WhatsApp |
| Resend | Enquiries are stored, the notification is logged instead of sent |
| Upstash | Rate limiting falls back to an in-memory limiter, per process only |

That in-memory limiter is useless across serverless instances, which is exactly
why production refuses to boot without the Redis credentials.

`next build` runs with `NODE_ENV=production`, so the build phase is exempt from
the production checks — otherwise CI could not build without every secret. Set
`SKIP_ENV_VALIDATION=true` to opt out anywhere else.

Generate `AUTH_SECRET` with `npx auth secret`.

## Migrations

```bash
npm run db:migrate          # create and apply a migration locally
npm run db:deploy           # apply pending migrations (CI / production)
npm run db:studio           # browse the data
npm run db:seed             # idempotent; safe to re-run
```

Migrations are additive and named for what they do. Never run `prisma db push`
against anything but a local database — it drops columns without asking.

The seed upserts on natural keys, so re-running it never duplicates rows and
never rewrites an existing admin password.

## Deploy

1. Create a Neon project. `DATABASE_URL` is the **pooled** connection string;
   `DIRECT_URL` is the **unpooled** one, which Prisma Migrate needs.
2. Set every variable from `.env.example` in the host's environment.
   `AUTH_URL` must be the site's real origin, or post-login redirects will
   point at the wrong host.
3. Run `npm run db:deploy` then `npm run db:seed` once, against production.
4. Deploy. `postinstall` runs `prisma generate`, so the client is always built
   against the current schema.
5. Sign in and change the seeded password immediately.

## Architecture notes

- **Two root shells.** `app/(site)` carries the public header, footer and
  WhatsApp button; `app/(admin)` does not. Metadata routes (`robots.ts`,
  `sitemap.ts`) live at the `app/` root, because they do not resolve reliably
  from inside a route group when there are two root layouts.
- **Reads go through `lib/queries/`.** Server Components call those functions
  directly. The routes under `app/api/` wrap the same functions for client-side
  filtering — there is no reason to round-trip through HTTP for a page that is
  already server-rendered.
- **Validation lives in `lib/validations/`** and is imported by both the form
  and the handler, so the two cannot drift.
- **Interactive sections are split** into a server shell that fetches and a
  client component that handles the interaction, so no section became a client
  component merely to get data.
- **Phone numbers are stored E.164** (`+91XXXXXXXXXX`), so `tel:` and `wa.me`
  links build straight off the column.
- **Deletes are soft** anywhere a record may be referenced. Gallery images are
  the only records with a real delete.

## The enquiry path

The one flow that must not fail quietly, in order:

1. Validate with the shared Zod schema.
2. Honeypot — a filled hidden field returns the success shape and stores
   nothing, rather than telling a bot it was caught.
3. Rate limit by IP: 3 per 10 minutes, 10 per day. Exceeding it returns 429
   naming the showroom phone number.
4. **Persist.** Always before notifying.
5. Notify by email. Failures are logged and absorbed; a Resend outage must
   never turn a saved enquiry into a failed request.

Attachments upload straight from the browser to Cloudinary via a signature from
`/api/upload/sign`; file bytes never pass through a route handler, and the API
only accepts attachment URLs on the Cloudinary host.

WhatsApp notification to the showroom is a stub in
`lib/notifications/whatsapp.ts`. The Meta Cloud API needs a verified business
and an approved template, which takes days, so it is not on the critical path.
The public-facing WhatsApp button is a plain `wa.me` link and needs no backend.

## Security

- Zod validation on every route handler and server action.
- Passwords bcrypt-hashed at cost 12. Never logged, never returned.
- Admin handlers and server actions re-check the session for themselves. A
  server action is a public POST endpoint; middleware is one config mistake
  away from not running.
- Failed sign-in returns one sentence whatever went wrong, and a missing
  account still runs a bcrypt comparison, so timing cannot be used to enumerate
  registered addresses.
- Enquiry PII never reaches the logs — ids and masked numbers only.
- CSV export neutralises leading `=`, `+`, `-` and `@`, without which a name
  entered as `=cmd|calc!A1` executes as a formula when the export is opened.
- Security headers, including a CSP, are set in `next.config.mjs`.

`script-src` carries `'unsafe-inline'` because the App Router injects inline
bootstrap scripts; removing it means threading a per-request nonce through
every response. The directives that actually contain an XSS — `object-src`,
`base-uri`, `frame-ancestors` and the `connect-src`/`img-src` allow-lists — are
all pinned.

## Testing

There is no automated test suite yet. Each layer was verified by exercising it
against a real PostgreSQL database and a real browser; the commit messages
record what was checked. A suite belongs on the enquiry path first — it is the
flow that earns money and the one with the most branches.
