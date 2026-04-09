## ADC Intelligence Dashboard (MVP)

Production-ready MVP that aggregates news and online information about **African Democratic Congress (ADC Nigeria)** and displays it on a clean dashboard.

### Features

- **RSS ingestion**: Google News RSS for `ADC Nigeria`
- **Storage**: Supabase Postgres table `articles` (dedupe by `link`)
- **Enrichment**:
  - Summary: OpenAI-compatible (optional) with a safe fallback
  - Sentiment: lightweight rule-based (`positive | neutral | negative`)
- **Dashboard**: cards + keyword search + sentiment filter
- **Background refresh**: Vercel Cron every 3 hours (`/api/cron/fetch`)

### Tech stack

- Next.js (App Router) + TypeScript + Tailwind
- Supabase (Postgres)
- Vercel (hosting + cron)

## Setup

### 1) Create Supabase table

In Supabase SQL Editor, run:

`supabase/schema.sql`

### 2) Configure environment variables

Copy `.env.example` to `.env.local` and fill in:

- **SUPABASE_URL**
- **SUPABASE_ANON_KEY**
- **SUPABASE_SERVICE_ROLE_KEY**
- **CRON_SECRET** (recommended)

Optional (summarization):

- **OPENAI_API_KEY**
- **OPENAI_BASE_URL** (defaults to `https://api.openai.com/v1`)
- **OPENAI_MODEL** (defaults to `gpt-4o-mini`)

### 3) Run locally

From `adc-intelligence-dashboard/`:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

### 4) Ingest data (manual)

Trigger ingestion (protected by `CRON_SECRET` if set):

```bash
curl -X POST "http://localhost:3000/api/fetch" \
  -H "Authorization: Bearer $CRON_SECRET"
```

Then refresh the dashboard.

## API

### `GET /api/articles`

Query params:

- **q**: keyword search in title/summary
- **sentiment**: `positive | neutral | negative`
- **limit**: `1..100` (default 50)

### `POST /api/fetch`

Manually triggers RSS ingest + enrichment.

Auth:

- `Authorization: Bearer <CRON_SECRET>` (recommended)
- or `?secret=<CRON_SECRET>`

### `GET /api/cron/fetch`

Same behavior as manual fetch. Intended for Vercel Cron.

## Deploy to Vercel

1. Push repo to GitHub
2. Import into Vercel
3. Set env vars in Vercel project settings (same as `.env.local`)
4. Cron schedule is defined in `vercel.json` (every 3 hours)

## Notes

- The app uses the **Supabase service role key** on the server. Never expose it to the browser.
