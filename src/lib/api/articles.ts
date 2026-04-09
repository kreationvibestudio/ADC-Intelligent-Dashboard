import type { Article, Sentiment } from "@/lib/types";

export type ArticlesResponse = { items: Article[] };

export async function fetchArticles(params: {
  q?: string;
  sentiment?: Sentiment | "all";
  limit?: number;
}): Promise<Article[]> {
  const url = new URL("/api/articles", window.location.origin);
  if (params.q) url.searchParams.set("q", params.q);
  if (params.limit) url.searchParams.set("limit", String(params.limit));
  if (params.sentiment && params.sentiment !== "all") {
    url.searchParams.set("sentiment", params.sentiment);
  }

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load articles (${res.status})`);
  }
  const json = (await res.json()) as ArticlesResponse;
  return json.items ?? [];
}

