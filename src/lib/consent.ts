// Согласие на аналитические cookies (152-ФЗ / GDPR).
// Пока пользователь не нажал «Принять», аналитика не собирается.
export type ConsentValue = "all" | "necessary";
const KEY = "cookie-consent-v1";

export function getConsent(): ConsentValue | null {
  try { return (localStorage.getItem(KEY) as ConsentValue | null) ?? null; } catch { return null; }
}
export function setConsent(v: ConsentValue) {
  try { localStorage.setItem(KEY, v); } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent("consent-change", { detail: v }));
}
export function clearConsent() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent("consent-change", { detail: null }));
}
