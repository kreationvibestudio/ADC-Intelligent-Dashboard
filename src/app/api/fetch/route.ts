import { NextRequest } from "next/server";
import { requireCronSecret } from "@/lib/auth/cron";
import { ingestGoogleNews } from "@/lib/news/ingest";

export async function POST(req: NextRequest) {
  const auth = requireCronSecret(req);
  if (!auth.ok) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await ingestGoogleNews("ADC Nigeria");
  return Response.json({ ok: true, result });
}

