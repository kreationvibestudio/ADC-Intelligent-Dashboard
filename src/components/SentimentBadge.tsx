import type { Sentiment } from "@/lib/types";

const styles: Record<Sentiment, string> = {
  positive: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  neutral: "bg-zinc-100 text-zinc-700 ring-zinc-600/20",
  negative: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

export function SentimentBadge({ sentiment }: { sentiment: Sentiment | null }) {
  const s = sentiment ?? "neutral";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${styles[s]}`}
    >
      {s}
    </span>
  );
}

