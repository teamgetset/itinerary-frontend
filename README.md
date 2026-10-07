# GETSET Tours & Travels: website frontend

Next.js 16 (App Router, Turbopack), React 19, TypeScript and Tailwind CSS 4.
All content comes from the GETSET API (`../getset-itinerary-backend`), managed in the admin (`../getset-itinerary-admin`).

## Scripts

```bash
cp .env.example .env.local   # NEXT_PUBLIC_API_URL, REVALIDATE_SECRET (same as the API's)
npm run dev        # http://localhost:3000 (the API must be running)
npm run build      # production build: pages are pre-rendered from the API, so it must be reachable
npm run lint
npm run typecheck
npm test           # node:test checks for trip totals, currency formatting, API mapping, wishlist storage
```

Deploying to Vercel: see [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md).

## Structure

```text
src/
  app/            routes: /, /branches/[slug], /packages, /packages/[slug], /destinations/[slug], /wishlist,
                  /account, /preview/packages/[id] (admin drafts), /api/revalidate, sitemap, robots
  components/     UI by feature (layout, hero, branches, packages, itinerary, currency, search, wishlist, ...)
  services/       the only way pages read data: cached, tagged API reads
  lib/            api client, API-to-UI mappers, pricing and formatting helpers, metadata, structured data
  types/          the UI's domain types
  hooks/          client hooks (wishlist store, reduced motion)
  config/         fixed brand facts (name, URL); everything editable comes from the API
```

## Data

- **Reads.** `services/*` call the public API through `lib/api.ts` (`fetchApi`) with cache tags (`catalog`,
  `testimonials`, `hero`, `content`). The API calls `POST /api/revalidate` after admin changes, which drops those
  tags immediately (`expire: 0`), so unpublished packages never linger. Pages also refresh hourly as a safety net.
- **Browser calls.** Paging of package grids, search and the wishlist query the public API directly; enquiries
  post to it.
- **Prices and currencies.** Packages carry official prices per currency (no conversion). `<Price>` renders every
  currency and the stylesheet in the root layout shows the one selected with the INR/AED toggle; the choice is kept
  in `localStorage` and applied before the page paints, so pages stay static.
- **Traveller pricing.** Adults, children and infants are priced from the package's price table
  (`lib/pricing.ts`, the same rule as the API's quote endpoint). The WhatsApp enquiry carries the party and the
  estimate in the selected currency; the enquiry form sends both to the API.
- **PDFs.** Download buttons link to the API, which always serves the version matching the current content.
- **Missing images** fall back to `public/images/placeholder.jpg` rather than breaking a page.

## Discovery flow

Home (hero, branch cards, all packages paged six at a time) → branch → package (day-by-day itinerary with timed
activities, PDF in two prints, traveller pricing, WhatsApp or enquiry form) → suggestions from other destinations.
Branch, destination and package pages are generated from the API: new ones need no code.

## Design system

Tokens live in `src/app/globals.css`. The palette is locked to the brand (default Tailwind colours are removed):
cobalt `#005894` and navy `#00386C` from the wordmark, sun `#FCCC50` from the TEAM tab as the single accent.

- **Shape:** the "leaf" from the logo's TEAM tab: top-right and bottom-left corners rounded (`leaf-xs` to `leaf-lg`). Icon buttons are circles.
- **Type:** Mona Sans. `type-display` (expanded width) for headlines, `type-code` for airport codes, `type-label` for small data labels.
- **Signature:** the dashed route line ending in a plane and an airport code, taken from the GT mark.
- **Motion:** CSS only, all of it off under `prefers-reduced-motion`. Scroll reveals use native scroll-driven animation; page changes and the card-to-hero photo morph use React `<ViewTransition>`.
