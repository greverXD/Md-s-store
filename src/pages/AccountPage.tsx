import { useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { fmt, fmtDate } from "@/lib/format";
import { DOLL_META } from "@/data/demo";
import { EmptyState, Notice, PageTitle, Spinner } from "@/components/ui";
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABEL, type OrderRow } from "@/lib/types";

export const ORDER_SELECT = "id, number, user_id, status, total, is_custom, contact, created_at, updated_at, order_items(id, kind, title, price, qty, config)";

export default function AccountPage() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [params] = useSearchParams();
  const justOrdered = params.get("order");

  useEffect(() => {
    if (!supabase || !user) return;
    const load = () => supabase!.from("orders").select(ORDER_SELECT).order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data as OrderRow[]) ?? []));
    load();
    // Статус обновится на странице сам, когда мастер его поменяет
    const ch = supabase.channel("my-orders")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `user_id=eq.${user.id}` }, load)
      .subscribe();
    return () => { supabase!.removeChannel(ch); };
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-12 py-16">
      <PageTitle eyebrow="Личный кабинет" title={`Здравствуйте${profile?.full_name ? `, ${profile.full_name}` : ""}!`} />

      {justOrdered && <div className="mb-8"><Notice kind="success">Заказ №{justOrdered} оформлен. Мастер уже получил уведомление и скоро свяжется с вами.</Notice></div>}

      <div className="grid lg:grid-cols-[1fr_300px] gap-10 items-start">
        <section>
          <h2 className="font-['Gilda_Display'] text-2xl text-[#3A2E27] mb-5">Мои заказы</h2>
          {orders === null ? <Spinner /> : orders.length === 0 ? (
            <EmptyState title="Заказов пока нет" action={<Link to="/builder" className="btn-primary">Собрать куклу</Link>} />
          ) : (
            <div className="space-y-4">{orders.map(o => <OrderCard key={o.id} order={o} />)}</div>
          )}
        </section>

        <aside className="card p-6 space-y-4">
          <p className="font-['Jost'] text-sm text-[#8B7B6E]">{user?.email}</p>
          <ProfileForm initialName={profile?.full_name ?? ""} initialPhone={profile?.phone ?? ""} onSaved={refreshProfile} />
          <button onClick={signOut} className="btn-outline w-full">Выйти</button>
        </aside>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: OrderRow["status"] }) {
  const color = status === "cancelled" ? "#C04040" : status === "delivered" ? "#4A7A4A" : "#B8975A";
  return (
    <span className="text-[11px] uppercase tracking-wider font-['Jost'] font-medium px-2.5 py-1 rounded-full"
      style={{ background: `${color}1A`, color }}>{ORDER_STATUS_LABEL[status]}</span>
  );
}

function OrderCard({ order }: { order: OrderRow }) {
  const step = ORDER_STATUS_FLOW.indexOf(order.status);
  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <p className="font-['Gilda_Display'] text-lg text-[#3A2E27]">Заказ №{order.number}</p>
          <p className="text-xs font-['Jost'] text-[#8B7B6E]">{fmtDate(order.created_at)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {order.status !== "cancelled" && (
        <div className="flex gap-1 mb-4" aria-label="Прогресс заказа">
          {ORDER_STATUS_FLOW.map((s, i) => (
            <div key={s} className="flex-1">
              <div className="h-1.5 rounded-full" style={{ background: i <= step ? "#B8975A" : "#EEE4D8" }} />
              <p className={`hidden sm:block text-[10px] font-['Jost'] mt-1 ${i <= step ? "text-[#3A2E27]" : "text-[#8B7B6E]"}`}>{ORDER_STATUS_LABEL[s]}</p>
            </div>
          ))}
        </div>
      )}

      <ul className="space-y-1.5 text-sm font-['Jost']">
        {order.order_items.map(it => (
          <li key={it.id} className="flex justify-between gap-3">
            <span className="text-[#3A2E27]">
              {it.title}{it.qty > 1 && ` × ${it.qty}`}
              {it.kind === "custom" && it.config?.outfit && (
                <span className="block text-xs text-[#8B7B6E]">
                  {it.config.dollType && DOLL_META[it.config.dollType]?.shortLabel}: {it.config.outfit.map(o => o.name).join(", ") || "базовая кукла"}
                </span>
              )}
            </span>
            <span className="text-[#8B7B6E] whitespace-nowrap">{fmt(it.price * it.qty)}</span>
          </li>
        ))}
      </ul>
      <div className="border-t mt-3 pt-3 flex justify-between font-['Jost'] font-medium">
        <span>Итого</span><span className="text-[#B8975A]">{fmt(order.total)}</span>
      </div>
    </div>
  );
}

function ProfileForm({ initialName, initialPhone, onSaved }: { initialName: string; initialPhone: string; onSaved: () => Promise<void> }) {
  const { user } = useAuth();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => { setName(initialName); setPhone(initialPhone); }, [initialName, initialPhone]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;
    const { error } = await supabase.from("profiles").update({ full_name: name, phone }).eq("id", user.id);
    setMsg(error ? "Не удалось сохранить" : "Сохранено");
    if (!error) await onSaved();
  };

  return (
    <form onSubmit={save} className="space-y-3">
      <input className="input" placeholder="Имя" value={name} maxLength={100} onChange={e => setName(e.target.value)} />
      <input className="input" placeholder="Телефон" type="tel" value={phone} maxLength={30} onChange={e => setPhone(e.target.value)} />
      <button className="btn-primary w-full">Сохранить</button>
      {msg && <p className="text-xs font-['Jost'] text-[#8B7B6E] text-center">{msg}</p>}
    </form>
  );
}
