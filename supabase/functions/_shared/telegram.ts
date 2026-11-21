export const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Отправляет сообщение в Telegram. Ошибка не ломает заказ — только пишется в лог. */
export async function sendTelegram(text: string): Promise<void> {
  const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const chats = (Deno.env.get("TELEGRAM_CHAT_ID") ?? "").split(",").map(s => s.trim()).filter(Boolean);
  if (!token || chats.length === 0) {
    console.warn("Telegram не настроен: задайте TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID");
    return;
  }
  for (const chat_id of chats) {
    try {
      const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id, text, parse_mode: "HTML", disable_web_page_preview: true }),
      });
      if (!r.ok) console.error("Telegram error", r.status, await r.text());
    } catch (e) {
      console.error("Telegram fetch failed", e);
    }
  }
}
