-- ADC Intelligence Dashboard (MVP)
-- Run this in Supabase SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source text,
  link text not null unique,
  published_at timestamptz,
  summary text,
  sentiment text check (sentiment in ('positive', 'neutral', 'negative')),
  created_at timestamptz not null default now()
);

create index if not exists articles_published_at_idx on public.articles (published_at desc);
create index if not exists articles_created_at_idx on public.articles (created_at desc);
create index if not exists articles_sentiment_idx on public.articles (sentiment);

-- Optional: enable basic full-text search on title + summary
create index if not exists articles_fts_idx
  on public.articles
  using gin (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(summary,'')));

-- RLS recommendation:
-- - Keep RLS ON
-- - Create a read-only policy for anon/auth if you want client-side reads.
-- For this MVP we read via server API using the service role key, so policies are optional.

