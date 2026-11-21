import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fmt, fmtDate } from "@/lib/format";
import { DOLL_META } from "@/data/demo";
import { FilterChip, Notice, Spinner } from "@/components/ui";
import { StatusBadge, ORDER_SELECT } from "@/pages/AccountPage";
import { ORDER_STATUS_LABEL, type OrderRow, type OrderStatus } from "@/lib/types";

const STATUSES = Object.keys(ORDER_STATUS_LABEL) as OrderStatus[];

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [filter, setFilter] = useState<OrderStatus | "all" | "active">("active");
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!supabase) return;
    let q = supabase.from("orders").select(ORDER_SELECT).order("created_at", { ascending: false }).limit(200);
    if (filter === "active") q = q.not("status", "in", "(delivered,cancelled)");
    else if (filter !== "all") q = q.eq("status", filter);
    const { data, error } = await q;
    if (error) setError(error.message); else setOrders(data as OrderRow[]);
  };

  useEffect(() => {
    setOrders(null);
    load();
    if (!supabase) return;
    const ch = supabase.channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => load())
      .subscribe();
    return () => { supabase!.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const setStatus = async (id: string, status: OrderStatus) => {
    if (!supabase) return;
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) setError(error.message); else load();
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        <FilterChip label="Активные" active={filter === "active"} onClick={() => setFilter("active")} />
        <FilterChip label="Все" active={filter === "all"} onClick={() => setFilter("all")} />
        {STATUSES.map(s => <FilterChip key={s} label={ORDER_STATUS_LABEL[s]} active={filter === s} onClick={() => setFilter(s)} />)}
      </div>
      {error && <div className="mb-4"><Notice kind="error">{error}</Notice></div>}
      {orders === null ? <Spinner /> : orders.length === 0 ? <Notice>Заказов нет.</Notice> : (
        <div className="space-y-4">
          {orders.map(o => (
            <div key={o.id} className="card p-5 grid md:grid-cols-[1fr_1fr_220px] gap-5">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <p className="font-['Gilda_Display'] text-lg">№{o.number}</p>
                  <StatusBadge status={o.status} />
                  {o.is_custom && <span className="text-[10px] uppercase tracking-wider font-['Jost'] text-[#8B7B6E]">на заказ</span>}
                </div>
                <p className="text-xs font-['Jost'] text-[#8B7B6E] mb-3">{fmtDate(o.created_at)}</p>
                <p className="text-sm font-['Jost']">{o.contact.name}</p>
                <a href={`tel:${o.contact.phone}`} className="text-sm font-['Jost'] text-[#B8975A]">{o.contact.phone}</a>
                <p className="text-sm font-['Jost'] text-[#8B7B6E]">{o.contact.address}</p>
                {o.contact.comment && <p className="text-sm font-['Jost'] text-[#3A2E27] mt-2 italic">«{o.contact.comment}»</p>}
              </div>
              <ul className="text-sm font-['Jost'] space-y-1.5">
                {o.order_items.map(it => (
                  <li key={it.id}>
                    {it.title}{it.qty > 1 && ` × ${it.qty}`} <span className="text-[#8B7B6E]">· {fmt(it.price * it.qty)}</span>
                    {it.config?.outfit && (
                      <span className="block text-xs text-[#8B7B6E]">
                        {it.config.dollType && DOLL_META[it.config.dollType]?.shortLabel}:{" "}
                        {it.config.outfit.map(x => x.name).join(", ") || "базовая кукла"}
                      </span>
                    )}
                  </li>
                ))}
                <li className="font-medium text-[#B8975A] pt-1">Итого {fmt(o.total)}</li>
              </ul>
              <div>
                <label className="block text-xs font-['Jost'] text-[#8B7B6E] mb-1 font-normal">Статус</label>
                <select className="input" value={o.status} onChange={e => setStatus(o.id, e.target.value as OrderStatus)}>
                  {STATUSES.map(s => <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
