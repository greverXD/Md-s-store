// Edge Function: создание заказа.
//  • проверяет пользователя и капчу;
//  • ограничивает частоту заказов;
//  • пересчитывает цены по базе (цене из браузера не доверяем);
//  • сохраняет заказ и отправляет уведомление мастеру в Telegram.
//
// Деплой: supabase functions deploy create-order
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { esc, sendTelegram } from "../_shared/telegram.ts";

type DollType = "textile" | "paola" | "nines" | "minikane";
const DOLL_TYPES: DollType[] = ["textile", "paola", "nines", "minikane"];
const DOLL_LABEL: Record<DollType, string> = { textile: "Авторская кукла", paola: "Paola Reina", nines: "Nines d'Onil", minikane: "MiniKane" };
const MAX_ORDERS_PER_HOUR = 5;
const MAX_LINES = 30;

interface ProductLine { type: "product"; productId: string; qty: number }
interface CustomLine { type: "custom"; dollType: DollType; itemIds: string[]; qty: number }
type Line = ProductLine | CustomLine;
interface Body {
  items: Line[];
  contact: { name: string; phone: string; address: string; comment?: string };
  captchaToken?: string | null;
}

const UUID = /^[0-9a-f-]{36}$/i;

class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

function validate(b: unknown): Body {
  const body = b as Body;
  if (!body || !Array.isArray(body.items) || body.items.length === 0 || body.items.length > MAX_LINES) throw new HttpError(400, "Корзина пуста");
  const c = body.contact;
  const s = (v: unknown, min: number, max: number) => typeof v === "string" && v.trim().length >= min && v.length <= max;
  if (!c || !s(c.name, 2, 100) || !s(c.phone, 6, 30) || !s(c.address, 3, 300) || (c.comment && !s(c.comment, 0, 1000))) {
    throw new HttpError(400, "Проверьте контактные данные");
  }
  for (const l of body.items) {
    if (!Number.isInteger(l.qty) || l.qty < 1 || l.qty > 20) throw new HttpError(400, "Неверное количество");
    if (l.type === "product") {
      if (!UUID.test(l.productId)) throw new HttpError(400, "Неизвестный товар");
    } else if (l.type === "custom") {
      if (!DOLL_TYPES.includes(l.dollType) || !Array.isArray(l.itemIds) || l.itemIds.length > 12 || !l.itemIds.every(id => UUID.test(id))) {
        throw new HttpError(400, "Неверный состав куклы");
      }
    } else throw new HttpError(400, "Неверная позиция");
  }
  return body;
}

async function verifyCaptcha(token: string | null | undefined, ip: string | null) {
  const secret = Deno.env.get("TURNSTILE_SECRET_KEY");
  if (!secret) return; // капча выключена
  if (!token) throw new HttpError(400, "Подтвердите, что вы не робот");
  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);
  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
  const data = await r.json();
  if (!data.success) throw new HttpError(400, "Проверка на робота не пройдена, попробуйте ещё раз");
}

Deno.serve(async req => {
  const cors = corsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { ...cors, "Content-Type": "application/json" } });

  try {
    if (req.method !== "POST") throw new HttpError(405, "Method not allowed");

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false },
    });

    // 1. Кто заказывает
    const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const { data: auth } = await admin.auth.getUser(jwt);
    const user = auth.user;
    if (!user) throw new HttpError(401, "Войдите в аккаунт, чтобы оформить заказ");

    const body = validate(await req.json().catch(() => null));
    await verifyCaptcha(body.captchaToken, req.headers.get("x-forwarded-for")?.split(",")[0] ?? null);

    // 2. Ограничение частоты
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await admin.from("orders").select("id", { count: "exact", head: true })
      .eq("user_id", user.id).gte("created_at", since);
    if ((count ?? 0) >= MAX_ORDERS_PER_HOUR) throw new HttpError(429, "Слишком много заказов за час. Напишите нам, если нужно больше.");

    // 3. Цены из базы
    const productIds = [...new Set(body.items.flatMap(l => l.type === "product" ? [l.productId] : []))];
    const outfitIds = [...new Set(body.items.flatMap(l => l.type === "custom" ? l.itemIds : []))];

    const [{ data: products, error: pErr }, { data: outfit, error: oErr }] = await Promise.all([
      productIds.length
        ? admin.from("products").select("id, name, price, in_stock, kind, doll_type").in("id", productIds).eq("active", true)
        : Promise.resolve({ data: [], error: null }),
      outfitIds.length
        ? admin.from("outfit_items").select("id, name, price, color, zone, doll_type").in("id", outfitIds).eq("active", true)
        : Promise.resolve({ data: [], error: null }),
    ]);
    if (pErr || oErr) throw new Error(pErr?.message ?? oErr?.message);
    const pMap = new Map((products ?? []).map(p => [p.id, p]));
    const oMap = new Map((outfit ?? []).map(o => [o.id, o]));

    let isCustom = false;
    const lines = body.items.map(l => {
      if (l.type === "product") {
        const p = pMap.get(l.productId);
        if (!p) throw new HttpError(409, "Один из товаров больше не продаётся. Обновите корзину.");
        if (!p.in_stock) isCustom = true; // изготовление на заказ
        return { product_id: p.id, kind: "product", title: p.name, price: p.price, qty: l.qty, config: p.in_stock ? null : { madeToOrder: true } };
      }
      isCustom = true;
      const items = l.itemIds.map(id => {
        const o = oMap.get(id);
        if (!o || o.doll_type !== l.dollType) throw new HttpError(409, "Одна из вещей гардероба недоступна. Соберите образ заново.");
        return o;
      });
      const zones = items.map(i => i.zone);
      if (new Set(zones).size !== zones.length) throw new HttpError(400, "В одну зону можно надеть только одну вещь");
      return {
        product_id: null,
        kind: "custom",
        title: `Кукла на заказ · ${DOLL_LABEL[l.dollType]}`,
        price: items.reduce((s, i) => s + i.price, 0),
        qty: l.qty,
        config: { dollType: l.dollType, outfit: items.map(i => ({ id: i.id, zone: i.zone, name: i.name, color: i.color, price: i.price })) },
      };
    });
    const total = lines.reduce((s, l) => s + l.price * l.qty, 0);

    // 4. Сохранение
    const contact = {
      name: body.contact.name.trim(), phone: body.contact.phone.trim(),
      address: body.contact.address.trim(), comment: (body.contact.comment ?? "").trim(),
    };
    const { data: order, error: insErr } = await admin.from("orders")
      .insert({ user_id: user.id, total, is_custom: isCustom, contact })
      .select("id, number").single();
    if (insErr) throw new Error(insErr.message);

    const { error: itemsErr } = await admin.from("order_items").insert(lines.map(l => ({ ...l, order_id: order.id })));
    if (itemsErr) {
      await admin.from("orders").delete().eq("id", order.id);
      throw new Error(itemsErr.message);
    }

    // Обновим имя/телефон в профиле для следующих заказов
    await admin.from("profiles").update({ full_name: contact.name, phone: contact.phone }).eq("id", user.id);

    // 5. Уведомление мастеру
    const notifyAll = Deno.env.get("TELEGRAM_NOTIFY_ALL") === "true";
    if (isCustom || notifyAll) {
      const siteUrl = (Deno.env.get("SITE_URL") ?? "").split(",")[0];
      const rows = lines.map(l => {
        const outfitText = l.kind === "custom" && l.config && "outfit" in l.config
          ? "\n    " + (l.config.outfit as { name: string; zone: string }[]).map(o => esc(o.name)).join(", ")
          : l.config ? " <i>(на заказ)</i>" : "";
        return `• ${esc(l.title)}${l.qty > 1 ? ` × ${l.qty}` : ""} — ${l.price * l.qty} ₽${outfitText}`;
      }).join("\n");
      await sendTelegram(
        `${isCustom ? "🧵 <b>Новый заказ на пошив</b>" : "🛍 <b>Новый заказ</b>"} №${order.number}\n\n` +
        `${rows}\n\n<b>Итого:</b> ${total} ₽\n` +
        `<b>Покупатель:</b> ${esc(contact.name)}, ${esc(contact.phone)}\n` +
        `<b>Адрес:</b> ${esc(contact.address)}` +
        (contact.comment ? `\n<b>Комментарий:</b> ${esc(contact.comment)}` : "") +
        (siteUrl && siteUrl !== "*" ? `\n\n<a href="${siteUrl}/admin">Открыть в админке</a>` : ""),
      );
    }

    return json({ id: order.id, number: order.number, total });
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.message }, e.status);
    console.error(e);
    return json({ error: "Внутренняя ошибка. Попробуйте позже." }, 500);
  }
});
