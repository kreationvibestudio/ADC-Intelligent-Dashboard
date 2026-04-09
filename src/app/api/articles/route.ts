import { NextRequest } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

function clampInt(v: string | null, { min, max, fallback }: { min: number; max: number; fallback: number }) {
  const n = v ? Number.parseInt(v, 10) : Number.NaN;
  if (Number.isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const sentiment = url.searchParams.get("sentiment");
  const q = url.searchParams.get("q");
  const limit = clampInt(url.searchParams.get("limit"), { min: 1, max: 100, fallback: 50 });

  const supabase = createSupabaseAdmin();
  let query = supabase
    .from("articles")
    .select("id,title,source,link,published_at,summary,sentiment,created_at")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (sentiment && ["positive", "neutral", "negative"].includes(sentiment)) {
    query = query.eq("sentiment", sentiment);
  }

  if (q && q.trim()) {
    const term = `%${q.trim()}%`;
    query = query.or(`title.ilike.${term},summary.ilike.${term}`);
  }

  const { data, error } = await query;
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ items: data ?? [] });
}

