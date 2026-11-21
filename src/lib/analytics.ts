import { getConsent } from "./consent";
import { supabase } from "./supabase";

// Откуда пришёл посетитель. Сохраняем «первое касание» сессии,
// чтобы переходы внутри сайта не затирали источник.
const SESSION_KEY = "visit-session-v1";

interface SessionInfo { id: string; referrer: string; utm: Record<string, string> }

function getSession(): SessionInfo {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  const params = new URLSearchParams(location.search);
  const utm: Record<string, string> = {};
  for (const k of ["utm_source", "utm_medium", "utm_campaign"]) {
    const v = params.get(k);
    if (v) utm[k] = v.slice(0, 100);
  }
  const info: SessionInfo = { id: crypto.randomUUID(), referrer: document.referrer, utm };
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(info)); } catch { /* ignore */ }
  return info;
}

let lastPath = "";

/** Отправляет просмотр страницы на /api/track (только если есть согласие). */
export async function trackPageView(path: string) {
  if (getConsent() !== "all" || path === lastPath) return;
  if (path.startsWith("/admin")) return; // админ не портит статистику
  lastPath = path;
  const s = getSession();
  const token = supabase ? (await supabase.auth.getSession()).data.session?.access_token : undefined;
  const body = JSON.stringify({ sessionId: s.id, path, referrer: s.referrer, ...s.utm, accessToken: token });
  try {
    await fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true });
  } catch { /* аналитика не должна ломать сайт */ }
}
