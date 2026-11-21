import { useEffect, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase } from "@/lib/supabase";
import { fmt } from "@/lib/format";
import { FilterChip, Notice, Spinner } from "@/components/ui";

interface Summary {
  visits: number; sessions: number; orders: number; revenue: number; signups: number;
  daily: { day: string; sessions: number }[];
  sources: { source: string; sessions: number }[];
  countries: { country: string; sessions: number }[];
  campaigns: { campaign: string; source: string | null; sessions: number }[];
  devices: { device: string; sessions: number }[];
}

const SOURCE_LABEL: Record<string, string> = {
  instagram: "Instagram", vk: "ВКонтакте", telegram: "Telegram", youtube: "YouTube", pinterest: "Pinterest",
  tiktok: "TikTok", facebook: "Facebook", ok: "Одноклассники", google: "Google", yandex: "Яндекс",
  avito: "Авито", direct: "Прямые заходы", other: "Другие сайты",
};
const DEVICE_LABEL: Record<string, string> = { mobile: "Телефон", desktop: "Компьютер", tablet: "Планшет", unknown: "Неизвестно" };

const countryName = (code: string) => {
  if (code === "??") return "Неизвестно";
  try { return new Intl.DisplayNames(["ru"], { type: "region" }).of(code) ?? code; } catch { return code; }
};

const GOLD = "#B8975A";

export default function AdminAnalytics() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    setData(null);
    supabase.rpc("analytics_summary", { days }).then(({ data, error }) => {
      if (error) setError(error.message); else setData(data as Summary);
    });
  }, [days]);

  if (error) return <Notice kind="error">{error}</Notice>;

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {[7, 30, 90, 365].map(d => <FilterChip key={d} label={d === 365 ? "Год" : `${d} дней`} active={days === d} onClick={() => setDays(d)} />)}
      </div>
      {!data ? <Spinner /> : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Посетители (сессии)" value={data.sessions.toLocaleString("ru-RU")} />
            <Stat label="Заказы" value={data.orders.toLocaleString("ru-RU")} />
            <Stat label="Выручка" value={fmt(data.revenue)} />
            <Stat label="Конверсия" value={data.sessions ? `${((data.orders / data.sessions) * 100).toFixed(1)}%` : "—"} />
          </div>

          <Panel title="Посетители по дням">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data.daily} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid stroke="#EEE4D8" vertical={false} />
                <XAxis dataKey="day" tickFormatter={d => d.slice(5).split("-").reverse().join(".")} tick={{ fontSize: 11, fill: "#8B7B6E" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#8B7B6E" }} />
                <Tooltip formatter={(v: number) => [v, "посетителей"]} labelFormatter={l => new Date(l).toLocaleDateString("ru-RU")} />
                <Area dataKey="sessions" stroke={GOLD} fill={GOLD} fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Panel>

          <div className="grid lg:grid-cols-2 gap-6">
            <Panel title="Откуда приходят">
              <Bars rows={data.sources.map(s => ({ label: SOURCE_LABEL[s.source] ?? s.source, value: s.sessions }))} />
            </Panel>
            <Panel title="Страны">
              <Bars rows={data.countries.map(c => ({ label: countryName(c.country), value: c.sessions }))} />
            </Panel>
            <Panel title="Устройства">
              <Bars rows={data.devices.map(d => ({ label: DEVICE_LABEL[d.device] ?? d.device, value: d.sessions }))} />
            </Panel>
            <Panel title="Рекламные кампании (UTM)">
              {data.campaigns.length === 0
                ? <p className="text-sm font-['Jost'] text-[#8B7B6E]">Пока нет. Добавляйте к ссылкам в соцсетях метки, например <code>?utm_source=instagram&amp;utm_campaign=new_year</code>.</p>
                : <Bars rows={data.campaigns.map(c => ({ label: `${c.campaign}${c.source ? ` · ${c.source}` : ""}`, value: c.sessions }))} />}
            </Panel>
          </div>
          <p className="text-xs font-['Jost'] text-[#8B7B6E]">Учитываются только посетители, согласившиеся на аналитические cookies. Новых регистраций за период: {data.signups}.</p>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-5">
      <p className="text-xs font-['Jost'] text-[#8B7B6E] mb-1">{label}</p>
      <p className="font-['Gilda_Display'] text-2xl text-[#3A2E27]">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <h3 className="font-['Jost'] font-medium text-sm text-[#3A2E27] mb-4">{title}</h3>
      {children}
    </section>
  );
}

function Bars({ rows }: { rows: { label: string; value: number }[] }) {
  if (rows.length === 0) return <p className="text-sm font-['Jost'] text-[#8B7B6E]">Нет данных</p>;
  return (
    <ResponsiveContainer width="100%" height={Math.max(120, rows.length * 32)}>
      <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 24 }}>
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis type="category" dataKey="label" width={130} tick={{ fontSize: 12, fill: "#3A2E27" }} axisLine={false} tickLine={false} />
        <Tooltip formatter={(v: number) => [v, "посетителей"]} cursor={{ fill: "#F5EEE6" }} />
        <Bar dataKey="value" fill={GOLD} radius={[0, 6, 6, 0]} barSize={16} label={{ position: "right", fontSize: 11, fill: "#8B7B6E" }} />
      </BarChart>
    </ResponsiveContainer>
  );
}
