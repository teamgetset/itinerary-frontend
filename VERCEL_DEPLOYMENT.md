# Deploying the website to Vercel

The customer website (this repository) runs on Vercel. The GETSET API and its database run on a separate server,
because the API needs Chrome to print PDFs, a permanent disk for uploads, and a process that stays running.

```text
Visitors ──▶ Website (Vercel) ──▶ GETSET API (separate server, public HTTPS) ──▶ PostgreSQL
                    ▲                         │
                    └── POST /api/revalidate ─┘   after every admin change
```

## Project settings

| Setting | Value |
| --- | --- |
| Framework preset | Next.js (detected) |
| Root directory | the repository root |
| Install command | default (`npm ci`, from `package-lock.json`) |
| Build command | default (`npm run build`, which runs `next build`) |
| Output | default. Next.js output is handled by Vercel; no `vercel.json` is needed |
| Node.js version | default (Next.js 16 needs 20.9 or newer) |

What the build produces: the home, packages, branch, destination and package pages are pre-rendered from the API
and refreshed when the API says content changed (hourly at the latest). New packages, branches and destinations get
their page on the first visit. `/api/revalidate` and `/preview/packages/[id]` run as functions.

## Environment variables

Set these in **Settings → Environment Variables**. Names only; never commit values.

| Name | Environments | Visible to browsers | What it is |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Production, Preview | yes (on purpose) | Public origin of the GETSET API, `https://` only, no path. Example shape: `https://api.teamgetset.com` |
| `NEXT_PUBLIC_SITE_URL` | Production, Preview | yes (on purpose) | The website's own address, used in canonical links, the sitemap and structured data. Defaults to `https://teamgetset.com` |
| `REVALIDATE_SECRET` | Production (Preview optional) | no | Same value as the API's `REVALIDATE_SECRET`, 24+ random characters. Lets the API refresh pages after admin changes |
| `GETSET_API_URL` | optional | no | A private address for server-side reads. Leave unset on Vercel; the public API address is used |

The build stops with a clear message if `NEXT_PUBLIC_API_URL` is missing, not `https://`, or includes a path, or if a
production build has no `REVALIDATE_SECRET`. `NEXT_PUBLIC_` values are baked in at build time: redeploy after
changing them.

The website holds no database URL, auth secret, JWT secret or admin credentials. Those stay on the API server.

## Backend URL

`NEXT_PUBLIC_API_URL` controls every API call:

- server-side page data: `<NEXT_PUBLIC_API_URL>/api/public/...` (or `GETSET_API_URL` if set),
- browser calls (package paging, search, wishlist, enquiries): `<NEXT_PUBLIC_API_URL>/api/public/...`,
- photos: `<NEXT_PUBLIC_API_URL>/media/...`, resized by Vercel's image optimiser (only this host and path are allowed),
- itinerary PDFs: `<NEXT_PUBLIC_API_URL>/api/public/packages/<slug>/pdf?branding=with-logo|without-logo`, downloaded
  straight from the API (it sends `Content-Disposition: attachment`).

If photos later move to a CDN host, add that host to `images.remotePatterns` in `next.config.ts`.

## CORS and the API's settings

On the API server, set:

| API variable | Value |
| --- | --- |
| `FRONTEND_URL` | The website's exact production origin, e.g. `https://teamgetset.com`: scheme and host, no trailing slash, and the same `www`/no-`www` choice as the primary domain in Vercel |
| `REVALIDATE_SECRET` | Same value as on Vercel |
| `API_URL` | The API's public `https://` address (photo and PDF links are built from it) |

`FRONTEND_URL` is the only website origin the API accepts from browsers (with `ADMIN_URL` for the admin), and the
address it calls to refresh pages. Browser requests carry no cookies or credentials. Localhost origins are only
accepted when `FRONTEND_URL` or `ADMIN_URL` is a localhost address, i.e. in development.

Vercel preview deployments have other addresses, so on previews pages render but paging, search, the wishlist and
enquiries are refused by the API. Test those on production, or point a staging API's `FRONTEND_URL` at a preview.

## Deployment steps

1. **Deploy the API first** on a server with Node 20.12+, PostgreSQL, Chrome or Chromium and a persistent disk,
   behind HTTPS (see `docs/DEPLOYMENT.md` in the main project). Run the migrations, create an admin account and
   enter the real branches, packages and prices. Check `GET https://<api>/health`.
2. In Vercel, **Add New → Project**, import `teamgetset/itinerary-frontend`, keep the detected settings.
3. Add the environment variables above, then **Deploy**.
4. **Settings → Domains**: add `teamgetset.com` (and `www`, redirecting to the primary one); update DNS as Vercel
   shows.
5. On the API server, set `FRONTEND_URL` to that primary origin and restart the API.
6. Check the live site: open a package directly by URL, switch INR/AED, download both PDFs, use search and page 2 of
   the home packages, send a test enquiry, then change something in the admin and see it on the site within seconds.

Optional: in **Settings → Functions**, choose a region close to the API server, so page refreshes are quick.

## Good to know

- **Plan.** Vercel's Hobby plan is for non-commercial use; a business site needs Pro. Image resizing is billed per
  transformation.
- **If the API is down,** pages already built keep being served. A page that has never been rendered (for example a
  package published moments before the outage) returns a plain error until the API is back; nothing broken is cached,
  so it recovers by itself. Monitor the API's `/health`.
- **Fonts** are downloaded at build time and served from the site itself; there are no third-party scripts or
  analytics.
