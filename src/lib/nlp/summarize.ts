import { getEnv } from "@/lib/env";

function stripHtml(input: string) {
  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function fallbackSummary(title: string, description?: string | null) {
  const base = stripHtml(description ?? "");
  const text = base.length ? base : title;
  const clipped = text.length > 320 ? `${text.slice(0, 317).trimEnd()}...` : text;

  // Ensure 2–3 sentence-ish output (best-effort) by splitting at periods.
  const sentences = clipped.split(/(?<=\.)\s+/).filter(Boolean);
  if (sentences.length >= 2) return sentences.slice(0, 3).join(" ").trim();
  return clipped;
}

export async function summarizeArticle(input: {
  title: string;
  description?: string | null;
}): Promise<string> {
  const env = getEnv();
  if (!env.OPENAI_API_KEY) return fallbackSummary(input.title, input.description);

  const baseUrl = env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
  const model = env.OPENAI_MODEL ?? "gpt-4o-mini";

  const prompt = [
    "Summarize the following news item in 2–3 short sentences.",
    "Be factual and neutral; do not add speculation.",
    "",
    `Title: ${input.title}`,
    input.description ? `Description: ${stripHtml(input.description)}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "You are a concise news summarizer." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    return fallbackSummary(input.title, input.description);
  }

  const json = (await res.json()) as any;
  const content = json?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    return fallbackSummary(input.title, input.description);
  }

  return content.trim();
}

