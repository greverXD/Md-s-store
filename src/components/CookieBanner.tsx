import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getConsent, setConsent } from "@/lib/consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(() => getConsent() === null);

  useEffect(() => {
    const onChange = () => setVisible(getConsent() === null);
    window.addEventListener("consent-change", onChange);
    return () => window.removeEventListener("consent-change", onChange);
  }, []);

  if (!visible) return null;
  return (
    <div className="fixed bottom-4 inset-x-4 sm:left-auto sm:right-6 sm:max-w-md z-50 card p-5" role="dialog" aria-label="Согласие на cookies">
      <p className="font-['Jost'] text-sm text-[#3A2E27] leading-relaxed mb-4">
        Мы используем cookies, чтобы сайт работал, и, с вашего согласия, чтобы понимать, откуда приходят посетители
        (соцсеть, страна). IP-адрес не сохраняем. Подробнее в{" "}
        <Link to="/privacy" className="text-[#B8975A] underline">политике конфиденциальности</Link>.
      </p>
      <div className="flex gap-2">
        <button className="btn-primary flex-1" onClick={() => setConsent("all")}>Принять</button>
        <button className="btn-outline flex-1" onClick={() => setConsent("necessary")}>Только необходимые</button>
      </div>
    </div>
  );
}
