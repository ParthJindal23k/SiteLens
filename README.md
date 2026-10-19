# Sitelens

Privacy-first, cookieless web analytics. Track visitors, sessions, live users, and geo + device
breakdowns across multiple websites with a one-line install script.

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Tailwind CSS 4** with shadcn/ui and Radix primitives
- **Drizzle ORM** on **Neon** (serverless Postgres)
- **Clerk** for authentication and subscription billing
- **Recharts** for dashboard visualizations

## Getting started

Install dependencies and copy the environment template:

```bash
npm install
cp .env.example .env
```

Fill in `.env`, then push the Drizzle schema to your Neon database:

```bash
npm run db:push
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NEON_DB_CONNECTION_STRING` | Neon Postgres connection string. Server-only — never give this the `NEXT_PUBLIC_` prefix, which would inline the credentials into the browser bundle |
| `NEXT_PUBLIC_HOST_URL` | Public origin used to build the install snippet, e.g. `https://sitelens.app` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Sign-in route, `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Sign-up route, `/sign-up` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | Post-sign-in fallback |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | Post-sign-up fallback |
| `CLERK_PRO_PLAN_SLUG` | Clerk billing plan that unlocks multiple websites. Defaults to `monthly` |
| `NEXT_PUBLIC_ANALYTICS_WEBSITE_ID` | Optional. Set to have Sitelens track itself; leave blank to inject no script |

## How tracking works

Adding a website in the dashboard generates a UUID and an install snippet:

```html
<script
  defer
  data-website-id="YOUR_WEBSITE_ID"
  data-domain="yourdomain.com"
  src="https://sitelens.app/analytics.js">
</script>
```

The script resolves its collector from its own `src`, so it works on any deployment without
rebuilding. It assigns each browser a visitor ID in `localStorage` (rotated every 12 hours), then
posts to two endpoints:

- `POST /api/track` — an `entry` event on load and an `exit` event on unload, carrying referrer,
  UTM parameters, and accumulated active time. The server enriches each event with device, OS,
  browser, and IP geolocation.
- `POST /api/live` — a heartbeat every 10 seconds that powers the live-user counter.
  `GET /api/live?websiteId=…` returns visitors seen in the last 30 seconds.

Both ingestion endpoints are necessarily public and CORS-open, so each request is checked against
`lib/ingest.ts`: the `websiteId` must be a known UUID and the request `Origin` must match that
website's registered domain (or a subdomain of it). Localhost traffic is only stored for websites
that enabled it. Requests that fail these checks are rejected rather than written.

`GET /api/website` aggregates pageviews into the dashboard payload: unique visitors, sessions,
active time, hourly and daily series, and breakdowns by country, region, city, device, OS, browser,
referrer, and UTM source. All time bucketing respects the timezone configured per website.

## Project layout

```
app/
  (auth)/           Clerk sign-in and sign-up routes
  (routes)/dashboard/
    new/            Add-website flow (form, then install script)
    website/[id]/   Per-site analytics and settings
    pricing/        Clerk PricingTable
  api/
    track/          Pageview ingestion
    live/           Live-visitor heartbeat and query
    website/        Website CRUD and analytics aggregation
    user/           Clerk user sync
  page.tsx          Marketing landing page
configs/
  db.tsx            Drizzle client
  schema.ts         Table definitions
  type.tsx          Shared dashboard types
lib/
  geo.ts            IP geolocation with safe fallbacks
  ingest.ts         Origin + websiteId authorization for public endpoints
  timezone.ts       IANA timezone options and legacy-value repair
public/analytics.js Tracking script served to customer sites
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Lint with ESLint |
| `npm run db:push` | Apply the schema diff directly to the database |
| `npm run db:generate` | Write a SQL migration for the current schema diff |
| `npm run db:migrate` | Run pending migrations from `drizzle/` |
| `npm run db:studio` | Browse the database in Drizzle Studio |

## Notes

Geolocation uses ip-api.com, whose free tier is HTTP-only and capped at 45 requests per minute.
Lookups time out after 2.5 seconds and degrade to `"Unknown"` rather than failing ingestion, so
sustained traffic will need a paid plan or a different provider.

`pageViews.entryTime` stores a unix timestamp as text for backwards compatibility, and the
analytics range filter casts it to `bigint`. The matching expression index is declared in the
schema; changing one without the other will silently drop index usage.
