# Elegance Bath Decor — Frontend Build Prompt

> Re-anchor later sessions with "re-read PROMPT.md".

## 1. Project

Build the marketing website for Elegance Bath Decor, a premium multi-brand tile
and bathware showroom in Ghaziabad, Uttar Pradesh, operating since 2009.

The audience is homeowners mid-renovation, plus architects, interior designers
and contractors sourcing for projects. The site's job is not e-commerce. It is
to make the showroom feel worth the drive, prove the brand roster is authentic,
and produce qualified enquiries — a phone call, a WhatsApp message, or a
completed enquiry form. Every page ends in one of those three actions.

Tone: confident, specific, no hard sell. Write like a showroom that does not
need to shout.

## 2. Stack and conventions

- Next.js 14, App Router, TypeScript strict mode
- Tailwind CSS with design tokens defined in `tailwind.config.ts`, not scattered
  arbitrary values
- `next/font` for typography, `next/image` for all imagery
- No UI component library. Hand-built components.
- Framer Motion permitted, but see the motion budget in §6
- Server Components by default; add `"use client"` only where interactivity
  requires it (carousels, accordion, form, mobile nav)
- No `localStorage`, no browser storage APIs
- Accessibility is a build requirement, not a pass at the end

Do not install packages beyond: `next`, `react`, `typescript`, `tailwindcss`,
`framer-motion`, `lucide-react`, `zod`, `react-hook-form`. Ask before adding
anything else.

## 3. Design system

Define these as Tailwind theme tokens and use them everywhere. No raw hex values
in components.

### Color

| Token | Hex | Use |
| --- | --- | --- |
| `brass` | `#C8A45D` | Primary accent — CTAs, icons, eyebrows, active states |
| `brass-soft` | `#E4D3AE` | Decorative marks, quote glyphs |
| `brass-tint` | `#FAF6EE` | Hover fills on light surfaces |
| `ink` | `#1A1A1A` | Headings |
| `ink-soft` | `#2A2A2A` | Dark buttons, footer-adjacent |
| `body` | `#6E6E6E` | Body copy |
| `line` | `#E8E6E2` | Borders, dividers |
| `surface` | `#FFFFFF` | Default background |
| `surface-alt` | `#F6F5F3` | Alternating section background |
| `footer` | `#1C1C1C` | Footer |

Sections alternate `surface` and `surface-alt`. The footer is the only dark
block on the page.

### Type

Manrope, one family, loaded via `next/font/google` with weights 400/500/600/700/800.

- Display (h1): clamp 2.6rem → 5rem, weight 800, tracking -0.035em, line-height 1.1
- Section heading (h2): clamp 1.75rem → 2.6rem, weight 800, tracking -0.02em
- Card heading (h3): 1.125rem, weight 700
- Body: 1rem / 1.65, color `body`
- Lede: 1.0625rem / 1.7
- Eyebrow: 0.8rem, weight 700, uppercase, letter-spacing 0.14em, color `brass`

Body copy stays under 80 characters per line. Section ledes are centered and
capped around 60ch.

### Layout

Max content width 1360px, gutter 40px desktop / 22px mobile. Vertical rhythm:
104px section padding desktop, 76px mobile. Radii: 10px small, 16px cards, 22px
large panels. Borders 1px solid `line`; shadows used sparingly and only on
elevated panels (form card, video frame).

## 4. Page structure — homepage

Build in this order. Each is its own component in `components/sections/`.

The site is no longer this page alone: `/products`, `/products/[slug]`,
`/gallery`, `/contact` and `/enquiry` are real routes. The list below still
describes the homepage, with a 4K product showcase added after the brand
marquee and the enquiry form moved off it onto `/enquiry`. See README.md,
"The public site".

1. **Header** — fixed. Left: wordmark "Elegance" with "BATH DECOR" beneath it.
   Right: phone number with icon, then a dark pill. Under 860px the nav
   collapses to a hamburger opening a panel below the bar.

   **Amended.** The nav was originally six in-page anchors — Home, About,
   Products, Brands, Gallery, Contact — on a single scrolling page. It is now
   four routes: Home, Products (hover panel of categories, the link itself going
   to `/products`), Gallery, Contact, with the pill reading "Send Enquiry" and
   pointing at `/enquiry`. About and Brands became sections of the home page
   rather than destinations. The header's three background states are described
   in README.md under "Architecture notes".
2. **Hero** — full viewport height, background photograph of a marble bathroom
   with a dark gradient scrim (55% top, 30% mid, 60% bottom). Centered content: a
   glass pill badge reading "Premium Multi-Brand Showroom" with a brass dot; h1
   "Design Spaces That Inspire" where only "Inspire" is brass; a one-sentence
   lede naming the categories; two buttons — brass "Explore Collection" with a
   right arrow, and a glass-backed "Contact Us" with a chat icon. A scroll cue at
   the bottom with a dot that drifts down on loop.
3. **Stats** — full-width `surface-alt` band, bordered top and bottom. Three
   centered figures: 5,000+ Products Available · 15+ Years of Trust · 1,00,000+
   Happy Customers. Indian digit grouping, exactly as written.
4. **Brand marquee** — a small centered label "Trusted partner brands", then an
   infinite horizontal scroll of the nine logos: Kajaria, AGL, Sunheart Ceramik,
   Lioli Ceramica, Simero, Lavis Ceramic, Mozart, Ivash, Massimo. Logos sit
   grayscale at 75% opacity, returning to full color on hover; the track pauses
   on hover. Duplicate the list in the DOM for a seamless loop and mask both
   edges.
5. **Showroom video** — centered heading block ("Inside Elegance" / "Step Inside
   Our Showroom" / walkthrough lede) above a 16:8.4 rounded frame holding the
   showroom video with a poster image and a circular white play button.
6. **Product categories** — left-aligned heading block ("Our Collections" /
   "Explore Product Categories" / lede) with previous/next circular arrow buttons
   pushed to the right edge of the same row. Below, a horizontally scrolling snap
   rail of portrait cards (3:3.6). Each card: full-bleed image, bottom gradient
   scrim, title and one line of description in white. Image scales 1.05 on hover.
   Arrows disable at the ends. The rail is swipeable on touch with the scrollbar
   hidden.
7. **Why Choose Us** — centered heading block, then a three-column grid of seven
   cards: Authentic Products · 9+ Premium Brands · Design Consultation ·
   Dedicated Support · Durability and Quality · Wide Selection of Styles · 15+
   Years of Trust. Each card has a 64px rounded icon tile in `surface-alt` with a
   brass line icon, a title, and two lines of copy. Border turns brass on hover
   with a soft brass-tinted shadow. The seventh card sits alone on the last row,
   left-aligned — do not stretch it.
8. **Testimonials** — `surface-alt`. Centered heading block, a large `brass-soft`
   quote glyph, then one testimonial at a time: italic quote, star row (filled to
   the actual rating, not always five), name, city, and a bordered "Google
   Review" chip. Below, previous/next arrows flanking a "1 / 4" counter. Four
   testimonials, none identical in shape — vary who is speaking (homeowner,
   architect, repeat customer).
9. **FAQ** — centered heading block, then a stacked accordion of five questions,
   one open at a time, first open by default. The plus icon rotates 45° and fills
   brass when open. Questions: home delivery · walk-in visits · design
   consultation · brands carried · bulk pricing for contractors and architects.
10. **Contact** — `surface-alt`. Centered heading block ("Get In Touch" / "Send Us
    An Enquiry" / 24-hour response promise). Two columns: left is "The Elegance
    Concierge" with three icon rows (showroom address, phone/WhatsApp, business
    hours) and a Google Maps embed with an "Open in Maps" overlay link. Right is
    an elevated white form card — see §5.
11. **Footer** — `footer` background. Four columns: a paragraph about the showroom
    plus phone, email and address with brass icons; Quick Links; Products (eight
    categories); Our Brands (nine brands). Bottom bar with copyright left,
    Privacy Policy and Terms right.
12. **Floating support button** — fixed bottom-right brass circle with a headset
    icon, above all content, with a brass glow shadow. Opens WhatsApp at the
    showroom number.

## 5. Enquiry form

Fields, in this order and pairing: Full Name\* and Phone Number\* on one row;
Email and City on the next; Brand and Product Category (both selects) on the
next; Message textarea; reference image upload accepting JPG, PNG, PDF;
full-width dark "Submit Enquiry" button with a paper-plane icon.

- Validate with zod + react-hook-form. Name and phone required; phone must be a
  valid Indian mobile number; email validated only if filled.
- Errors appear beneath the field in plain language that says what to fix. No red
  walls, no apologies.
- Brand and category options come from `lib/data/brands.ts` and
  `lib/data/categories.ts` — the same source the footer, the nav dropdown and the
  category rail read from. This is non-negotiable; nothing is hardcoded twice.
- Post to `app/api/enquiry/route.ts`. For now it validates and returns 200 with a
  stub comment marking where persistence goes later. Do not add a database in
  this pass.
- On success the form is replaced by a short confirmation naming what happens
  next and offering the WhatsApp number as a faster route.

## 6. Motion budget

**Superseded.** This section originally asked for "one orchestrated moment, not
effects everywhere", and named scroll-triggered entrances, parallax, counting-up
figures and staggered card reveals as *not permitted*. The showroom has since
asked for a fully animated premium page, and all four are now in the build. The
original rule is recorded here so nobody re-reads it as current.

The budget that replaces it is about cost, not restraint:

- Animate only `transform`, `opacity`, or a custom property that feeds one of
  them. Nothing that goes through layout — no width, height, top, left, margin
  or background-position — because a reflow does not fit in the 8.3ms a 120Hz
  display allows. One opt-in exception: the entry blur on `<Reveal blur>`.
- One scroll listener and one animation frame for the page, in
  `lib/motion/raf.ts`. Components subscribe to it; none adds its own listener,
  and none reads layout inside the callback.
- Pointer effects measure their box on `pointerenter`, never on `pointermove`.
- Per-frame values are written to the DOM from refs, not held in React state.
- Prefer a CSS scroll-driven animation where the browser has one: it runs off
  the main thread.
- Respect `prefers-reduced-motion` by disabling all of it, in the single block
  at the end of `app/globals.css`. Nothing may carry meaning through motion
  alone, and a reader without JavaScript must still see every section.

## 7. Content rules

- Real content only. No lorem ipsum, no "Feature One", no placeholder names.
- Phone: +91 98732 55836. Email: info@elegancebathdecor.com.
- Address: II, 97A, Block F, Nehru Nagar II, Nehru Nagar, Ghaziabad, Uttar
  Pradesh 201001.
- Hours: Mon–Sat 10:00 AM – 8:00 PM, Sunday 11:00 AM – 6:00 PM.
- Buttons name what happens: "Submit Enquiry", "Explore Collection". Never
  "Submit", never "Learn More".
- Sentence case for everything except eyebrows.
- Product categories: Designer Tiles, Wall Tiles, Floor Tiles, Sanitaryware,
  Faucets, Wash Basins, Large Slabs, Bathroom Accessories.

## 8. Assets

Images go in `public/assets/` under `hero/`, `brands/`, `categories/`,
`showroom/`. Where a real asset is missing, render a warm neutral gradient block
at the correct aspect ratio with a TODO comment naming the exact file expected —
never a broken image, never a grey box with text in it. Every `next/image` needs
real width/height or `fill` with a sized parent, plus descriptive alt text. The
hero image is `priority`; everything else lazy-loads.

## 9. Quality floor

- Responsive at 375, 768, 1024, 1440 and 1920 — check all five, no horizontal
  scroll at any width
- Visible keyboard focus on every interactive element; the carousel, accordion
  and dropdown all operate from the keyboard
- Semantic landmarks, one h1 per page, headings in order
- Text contrast meets WCAG AA against its actual background, including white text
  over the hero scrim
- Lighthouse: performance and accessibility both 90+ on mobile
- Metadata per page: title, description, Open Graph tags, plus LocalBusiness
  JSON-LD on the homepage with the address, hours, phone and geo coordinates

## 10. Build order

Work in this sequence and stop for review at each checkpoint.

1. Scaffold: Next.js + TS + Tailwind, tokens in config, fonts wired, `lib/data/`
   files for brands and categories, shared UI primitives (Button, SectionHeading,
   Container).
2. Header + Hero + Footer. **Checkpoint.**
3. Stats, brand marquee, showroom video.
4. Category rail and Why Choose Us.
5. Testimonials and FAQ.
6. Contact section and the enquiry API route. **Checkpoint.**
7. Responsive pass at all five widths, accessibility pass, metadata and JSON-LD.

## 11. How to work

- Before each section, state in two sentences what you're about to build and any
  assumption you're making. Then build it.
- Prefer editing existing files over creating parallel versions. No `index-v2.tsx`.
- If a requirement here conflicts with something you'd normally do, follow this
  document and say so.
- If something is genuinely ambiguous, ask one question rather than guessing
  across three files.
- After each checkpoint, list what is done and what remains, briefly.
