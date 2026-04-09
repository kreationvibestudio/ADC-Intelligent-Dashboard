import { NextRequest } from "next/server";
import { getEnv } from "@/lib/env";

export function requireCronSecret(req: NextRequest) {
  const { CRON_SECRET } = getEnv();
  if (!CRON_SECRET) return { ok: true as const };

  const header = req.headers.get("authorization");
  if (header?.startsWith("Bearer ") && header.slice("Bearer ".length) === CRON_SECRET) {
    return { ok: true as const };
  }

  const url = new URL(req.url);
  const qs = url.searchParams.get("secret");
  if (qs && qs === CRON_SECRET) return { ok: true as const };

  return { ok: false as const };
}

