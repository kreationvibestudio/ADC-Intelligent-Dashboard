"use client";

import { useEffect, useMemo, useState } from "react";
import type { Article, Sentiment } from "@/lib/types";
import { fetchArticles } from "@/lib/api/articles";
import { ArticleCard } from "@/components/ArticleCard";

type SentimentFilter = Sentiment | "all";

function Spinner() {
  return (
    <div className="inline-flex items-center gap-2 text-sm text-zinc-600">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700" />
      Loading…
    </div>
  );
}

export default function Home() {
  const [items, setItems] = useState<Article[]>([]);
  const [q, setQ] = useState("");
  const [sentiment, setSentiment] = useState<SentimentFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = useMemo(() => {
    const trimmed = q.trim();
    return { q: trimmed.length ? trimmed : undefined, sentiment, limit: 50 };
  }, [q, sentiment]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    fetchArticles(params)
      .then((data) => {
        if (!alive) return;
        setItems(data);
      })
      .catch((e: unknown) => {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Failed to load articles");
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [params]);

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-6 sm:px-6">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
              ADC Intelligence Dashboard
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Latest online coverage about African Democratic Congress (ADC Nigeria).
            </p>
          </div>
          <div className="hidden text-xs text-zinc-500 sm:block">
            Showing {items.length} items
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="w-full sm:max-w-sm">
              <label className="sr-only" htmlFor="q">
                Search
              </label>
              <input
                id="q"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search keywords…"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-200"
              />
            </div>

            <div className="w-full sm:w-56">
              <label className="sr-only" htmlFor="sentiment">
                Sentiment
              </label>
              <select
                id="sentiment"
                value={sentiment}
                onChange={(e) => setSentiment(e.target.value as SentimentFilter)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-200"
              >
                <option value="all">All sentiment</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            {loading ? <Spinner /> : null}
            <button
              type="button"
              onClick={() => {
                // re-trigger effect by nudging query state
                setQ((v) => v);
              }}
              className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-200"
            >
              Refresh
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            {error}
          </div>
        ) : null}

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>

        {!loading && items.length === 0 && !error ? (
          <div className="mt-10 rounded-2xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-600">
            No articles yet. Run the fetch endpoint to ingest data.
          </div>
        ) : null}
      </main>
    </div>
  );
}
