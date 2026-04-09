import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { fetchGoogleNewsRss, parseGoogleNewsRss } from "@/lib/news/rss";
import { summarizeArticle } from "@/lib/nlp/summarize";
import { analyzeSentiment } from "@/lib/nlp/sentiment";

export type IngestResult = {
  fetched: number;
  parsed: number;
  inserted: number;
  skippedDuplicates: number;
};

function toIsoOrNull(d: string | null) {
  if (!d) return null;
  const ms = Date.parse(d);
  if (Number.isNaN(ms)) return null;
  return new Date(ms).toISOString();
}

export async function ingestGoogleNews(query: string): Promise<IngestResult> {
  const xml = await fetchGoogleNewsRss(query);
  const parsed = parseGoogleNewsRss(xml);

  if (parsed.length === 0) {
    return { fetched: 1, parsed: 0, inserted: 0, skippedDuplicates: 0 };
  }

  const supabase = createSupabaseAdmin();

  // Upsert on unique "link" to avoid duplicates.
  // We only insert the base fields here; summary/sentiment will be filled in the pipeline step.
  const payload = parsed.map((a) => ({
    title: a.title,
    source: a.source,
    link: a.link,
    published_at: toIsoOrNull(a.publishedAt),
  }));

  const { data, error } = await supabase
    .from("articles")
    .upsert(payload, {
      onConflict: "link",
      ignoreDuplicates: true,
    })
    .select("id,title,link");

  if (error) throw error;

  const inserted = data?.length ?? 0;
  const skippedDuplicates = parsed.length - inserted;

  if (data && data.length > 0) {
    const descriptionByLink = new Map(parsed.map((a) => [a.link, a.description]));

    const updates = await Promise.all(
      data.map(async (row) => {
        const description = descriptionByLink.get(row.link) ?? null;
        const summary = await summarizeArticle({ title: row.title, description });
        const sentiment = analyzeSentiment(`${row.title}\n${summary}`);
        return { id: row.id, summary, sentiment };
      }),
    );

    const { error: updateErr } = await supabase.from("articles").upsert(updates, {
      onConflict: "id",
    });
    if (updateErr) throw updateErr;
  }

  return {
    fetched: 1,
    parsed: parsed.length,
    inserted,
    skippedDuplicates,
  };
}

