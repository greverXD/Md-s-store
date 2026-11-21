import { isDemo } from "@/lib/supabase";
export function DemoBanner() {
  if (!isDemo) return null;
  return (
    <div className="bg-[#3A2E27] text-white text-center text-xs font-['Jost'] py-1.5 px-4">
      Демо-режим: Supabase не подключён, показаны товары из макета. Заполните .env (см. README).
    </div>
  );
}
