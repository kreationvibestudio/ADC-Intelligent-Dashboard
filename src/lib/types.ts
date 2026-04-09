export type Sentiment = "positive" | "neutral" | "negative";

export type Article = {
  id: string;
  title: string;
  source: string | null;
  link: string;
  published_at: string | null;
  summary: string | null;
  sentiment: Sentiment | null;
  created_at: string;
};

