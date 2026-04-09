import { XMLParser } from "fast-xml-parser";

export type RssArticle = {
  title: string;
  source: string | null;
  link: string;
  publishedAt: string | null;
  description: string | null;
};

function coerceArray<T>(v: T | T[] | undefined | null): T[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function normalizeWhitespace(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

function pickText(v: unknown): string | null {
  if (typeof v === "string") return normalizeWhitespace(v);
  if (v && typeof v === "object" && "#text" in (v as any) && typeof (v as any)["#text"] === "string") {
    return normalizeWhitespace((v as any)["#text"]);
  }
  return null;
}

export async function fetchGoogleNewsRss(query: string) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "ADC-Intelligence-Dashboard/1.0 (+https://vercel.com) rss-fetcher",
      accept: "application/rss+xml, application/xml;q=0.9, */*;q=0.8",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`RSS fetch failed (${res.status})`);
  }

  return await res.text();
}

export function parseGoogleNewsRss(xml: string): RssArticle[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    allowBooleanAttributes: true,
    trimValues: false,
  });

  const doc = parser.parse(xml) as any;
  const items = coerceArray(doc?.rss?.channel?.item);

  return items
    .map((item: any) => {
      const title = pickText(item?.title) ?? "";
      const link = pickText(item?.link) ?? "";

      // Google News RSS commonly includes <source>Publisher</source>
      const source = pickText(item?.source);

      // pubDate like: "Wed, 09 Apr 2026 10:00:00 GMT"
      const publishedAt = pickText(item?.pubDate);

      if (!title || !link) return null;

      return {
        title,
        link,
        source,
        publishedAt,
        description: pickText(item?.description),
      } satisfies RssArticle;
    })
    .filter(Boolean) as RssArticle[];
}

