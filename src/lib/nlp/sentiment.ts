export type Sentiment = "positive" | "neutral" | "negative";

const POSITIVE = [
  "wins",
  "win",
  "victory",
  "celebrates",
  "endorse",
  "endorses",
  "applauds",
  "progress",
  "growth",
  "boost",
  "success",
  "improves",
  "improvement",
  "supports",
  "support",
  "peace",
];

const NEGATIVE = [
  "accuse",
  "accuses",
  "accused",
  "allegation",
  "allegations",
  "arrest",
  "arrested",
  "attack",
  "attacks",
  "crisis",
  "criticize",
  "criticises",
  "criticized",
  "death",
  "fraud",
  "court",
  "protest",
  "violence",
  "scandal",
  "threat",
];

function normalize(s: string) {
  return s.toLowerCase();
}

export function analyzeSentiment(text: string): Sentiment {
  const t = normalize(text);

  let score = 0;
  for (const w of POSITIVE) if (t.includes(w)) score += 1;
  for (const w of NEGATIVE) if (t.includes(w)) score -= 1;

  if (score >= 2) return "positive";
  if (score <= -2) return "negative";
  return "neutral";
}

