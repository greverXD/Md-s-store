import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { isDemo, supabase } from "@/lib/supabase";
import { fmt } from "@/lib/format";
import { DOLL_META } from "@/data/demo";
import { EmptyState, Notice, PageTitle } from "@/components/ui";
import { Turnstile, captchaEnabled } from "@/components/Turnstile";
import type { Contact } from "@/lib/types";

export default function CartPage() {
  const { items, total, setQty, remove, clear } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact>({ name: "", phone: "", address: "", comment: "" });
  const [agree, setAgree] = useState(false);
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <EmptyState title="Корзина пуста" text="Загляните в каталог или соберите свою куклу в конструкторе."
          action={<div className="flex gap-3 justify-center"><Link to="/dolls" className="btn-primary">Каталог</Link><Link to="/builder" className="btn-outline">Конструктор</Link></div>} />
      </div>
    );
  }

  const name = contact.name || profile?.full_name || "";
  const phone = contact.phone || profile?.phone || "";

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!supabase) return;
    if (captchaEnabled && !captcha) { setError("Подтвердите, что вы не робот."); return; }
    setSending(true);
    const payload = {
      items: items.map(i => i.type === "product"
        ? { type: "product" as const, productId: i.productId, qty: i.qty }
        : { type: "custom" as const, dollType: i.dollType, itemIds: i.outfit.map(o => o.itemId), qty: i.qty }),
      contact: { ...contact, name, phone },
      captchaToken: captcha,
    };
    const { data, error } = await supabase.functions.invoke("create-order", { body: payload });
    setSending(false);
    if (error) {
      let msg = "Не удалось оформить заказ. Попробуйте ещё раз.";
      try { const body = await (error as { context?: Response }).context?.json(); if (body?.error) msg = body.error; } catch { /* ignore */ }
      setError(msg);
      window.turnstile?.reset();
      return;
    }
    clear();
    navigate(`/account?order=${data.number}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16">
      <PageTitle eyebrow="Оформление" title="Корзина" />
      <div className="grid lg:grid-cols-[1fr_400px] gap-10 items-start">
        <div className="space-y-4">
          {items.map(i => (
            <div key={i.key} className="card p-4 flex gap-4 items-center">
              <div className="w-20 h-24 rounded-xl overflow-hidden shrink-0 bg-[#F5EEE6] flex items-center justify-center">
                {i.type === "product"
                  ? <img src={i.image} alt="" className="w-full h-full object-cover" />
                  : <div className="flex flex-wrap gap-1 p-2 justify-center">{i.outfit.map(o => <span key={o.itemId} className="w-4 h-4 rounded-full" style={{ background: o.color }} />)}</div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-['Gilda_Display'] text-[#3A2E27]">{i.name}</p>
                {i.type === "custom" && (
                  <p className="text-xs font-['Jost'] text-[#8B7B6E] mt-1">
                    {DOLL_META[i.dollType].shortLabel}: {i.outfit.map(o => o.name).join(", ") || "базовая кукла"}
                  </p>
                )}
                <p className="font-['Jost'] text-sm text-[#B8975A] mt-1">{fmt(i.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setQty(i.key, i.qty - 1)} className="w-7 h-7 rounded-full border flex items-center justify-center text-[#8B7B6E]" aria-label="Меньше"><Minus size={12} /></button>
                <span className="w-6 text-center font-['Jost'] text-sm">{i.qty}</span>
                <button onClick={() => setQty(i.key, i.qty + 1)} className="w-7 h-7 rounded-full border flex items-center justify-center text-[#8B7B6E]" aria-label="Больше"><Plus size={12} /></button>
              </div>
              <button onClick={() => remove(i.key)} className="text-[#8B7B6E] hover:text-[#C04040]" aria-label="Удалить"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>

        <aside className="card p-6 lg:sticky lg:top-24">
          <div className="flex justify-between font-['Jost'] text-lg mb-6">
            <span>Итого</span><span className="text-[#B8975A] font-medium">{fmt(total)}</span>
          </div>

          {isDemo ? (
            <Notice>Оформление заказа заработает после подключения Supabase.</Notice>
          ) : !user ? (
            <div className="space-y-3">
              <Notice>Чтобы оформить заказ и следить за его статусом, войдите или зарегистрируйтесь.</Notice>
              <Link to="/login" state={{ from: "/cart" }} className="btn-primary block text-center">Войти</Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <input className="input" placeholder="Имя и фамилия" required maxLength={100}
                value={name} onChange={e => setContact({ ...contact, name: e.target.value })} />
              <input className="input" placeholder="Телефон" required type="tel" maxLength={30} pattern="[0-9+()\- ]{6,30}"
                value={phone} onChange={e => setContact({ ...contact, phone: e.target.value })} />
              <input className="input" placeholder="Город, адрес или пункт выдачи" required maxLength={300}
                value={contact.address} onChange={e => setContact({ ...contact, address: e.target.value })} />
              <textarea className="input min-h-20" placeholder="Комментарий для мастера (необязательно)" maxLength={1000}
                value={contact.comment} onChange={e => setContact({ ...contact, comment: e.target.value })} />
              <label className="flex gap-2 items-start text-xs font-['Jost'] text-[#8B7B6E] font-normal">
                <input type="checkbox" required checked={agree} onChange={e => setAgree(e.target.checked)} className="mt-0.5 accent-[#B8975A]" />
                <span>Согласен(на) на обработку персональных данных для выполнения заказа согласно <Link to="/privacy" className="text-[#B8975A] underline">политике</Link></span>
              </label>
              <Turnstile onToken={setCaptcha} />
              {error && <Notice kind="error">{error}</Notice>}
              <button type="submit" disabled={sending || !agree} className="btn-primary w-full">
                {sending ? "Отправляем…" : "Оформить заказ"}
              </button>
              <p className="text-xs font-['Jost'] text-[#8B7B6E]">Итоговая сумма пересчитывается на сервере по актуальным ценам.</p>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}
