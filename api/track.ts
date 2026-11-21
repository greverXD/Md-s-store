// Vercel Serverless Function: POST /api/track
// Принимает просмотр страницы и пишет его в таблицу visits.
// Страна берётся из заголовка Vercel x-vercel-ip-country — IP не сохраняется.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

const BOT_RE = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|vkshare|telegrambot/i;

const SOURCES: [RegExp, string][] = [
  [/instagram|^ig$/i, "instagram"],
  [/vk\.com|vk\.ru|^vk$|vkontakte/i, "vk"],
  [/t\.me|telegram|^tg$/i, "telegram"],
  [/youtube|youtu\.be/i, "youtube"],
  [/pinterest|pin\.it/i, "pinterest"],
  [/tiktok/i, "tiktok"],
  [/facebook|fb\.com|^fb$/i, "facebook"],
  [/ok\.ru|odnoklassniki/i, "ok"],
  [/avito/i, "avito"],
  [/google\./i, "google"],
  [/yandex|ya\.ru/i, "yandex"],
];

function classify(utmSource: string | null, referrerHost: string | null, ownHost: string | undefined): string {
  const probe = utmSource || referrerHost;
  if (!probe || (ownHost && referrerHost === ownHost)) return "direct";
  for (const [re, name] of SOURCES) if (re.test(probe)) return name;
  return utmSource ? utmSource.toLowerCase().slice(0, 30) : "other";
}

function device(ua: string): string {
  if (/ipad|tablet/i.test(ua)) return "tablet";
  if (/mobi|android|iphone/i.test(ua)) return "mobile";
  return "desktop";
}

const str = (v: unknown, max: number) => (typeof v === "string" && v.length ? v.slice(0, max) : null);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const ua = String(req.headers["user-agent"] ?? "");
  if (BOT_RE.test(ua)) return res.status(204).end();

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body ?? {};
  const sessionId = str(body.sessionId, 64);
  const path = str(body.path, 200);
  if (!sessionId || !path || !/^[\w-]+$/.test(sessionId)) return res.status(400).end();

  let referrerHost: string | null = null;
  try { referrerHost = body.referrer ? new URL(body.referrer).hostname.replace(/^www\./, "") : null; } catch { /* ignore */ }

  let userId: string | null = null;
  if (typeof body.accessToken === "string") {
    const { data } = await supabase.auth.getUser(body.accessToken);
    userId = data.user?.id ?? null;
  }

  const utmSource = str(body.utm_source, 100);
  const ownHost = String(req.headers.host ?? "").replace(/^www\./, "");
  const { error } = await supabase.from("visits").insert({
    session_id: sessionId,
    user_id: userId,
    path,
    source: classify(utmSource, referrerHost, ownHost),
    referrer_host: referrerHost === ownHost ? null : referrerHost,
    utm_source: utmSource,
    utm_medium: str(body.utm_medium, 100),
    utm_campaign: str(body.utm_campaign, 100),
    country: str(req.headers["x-vercel-ip-country"], 2),
    device: device(ua),
  });
  if (error) console.error("track insert failed", error.message);
  return res.status(204).end();
}
