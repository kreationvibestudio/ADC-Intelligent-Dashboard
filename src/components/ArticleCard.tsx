import type { Article } from "@/lib/types";
import { SentimentBadge } from "@/components/SentimentBadge";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

export function ArticleCard({ article }: { article: Article }) {
  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-pretty text-sm font-semibold leading-6 text-zinc-900 group-hover:underline">
          {article.title}
        </h3>
        <SentimentBadge sentiment={article.sentiment} />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-600">
        <span className="font-medium text-zinc-700">{article.source ?? "Unknown source"}</span>
        <span className="text-zinc-300">•</span>
        <span>{formatDate(article.published_at ?? article.created_at)}</span>
      </div>

      <p className="mt-3 line-clamp-4 text-sm leading-6 text-zinc-700">
        {article.summary ?? "No summary available yet."}
      </p>

      <div className="mt-4 text-xs font-medium text-zinc-500 group-hover:text-zinc-700">
        Open article →
      </div>
    </a>
  );
}

