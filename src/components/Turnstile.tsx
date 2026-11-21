import { useEffect, useRef } from "react";

// Cloudflare Turnstile — бесплатная капча, обычно невидимая для людей.
// Без VITE_TURNSTILE_SITE_KEY компонент ничего не рисует (удобно для разработки).
declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: { sitekey: string; callback: (t: string) => void; "expired-callback"?: () => void; language?: string }) => string;
      reset: (id?: string) => void;
      remove: (id: string) => void;
    };
  }
}

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;
export const captchaEnabled = !!SITE_KEY;

let scriptPromise: Promise<void> | null = null;
function loadScript() {
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.onload = () => resolve();
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

export function Turnstile({ onToken }: { onToken: (token: string | null) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!SITE_KEY || !ref.current) return;
    let id: string | undefined;
    loadScript().then(() => {
      if (!ref.current || !window.turnstile) return;
      id = window.turnstile.render(ref.current, {
        sitekey: SITE_KEY,
        language: "ru",
        callback: t => onToken(t),
        "expired-callback": () => onToken(null),
      });
    });
    return () => { if (id && window.turnstile) window.turnstile.remove(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!SITE_KEY) return null;
  return <div ref={ref} className="my-2" />;
}
