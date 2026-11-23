# Кукольный Дом — интернет-магазин кукол

React + TypeScript + Vite + Tailwind, бэкенд на Supabase. Дизайн перенесён из макета Figma Make «Интернет-магазин кукол».

**Что умеет:**
- каталог авторских кукол (фильтры по росту, волосам, глазам, коллекции), одежды для Paola Reina / Nines d'Onil / MiniKane, аксессуаров;
- конструктор образа: базовая кукла + вещи из «гардероба», заказ собранной куклы;
- корзина и оформление заказа (цены пересчитываются на сервере);
- вход по почте и паролю и через Google, восстановление пароля;
- личный кабинет: заказы и их статусы, обновляются в реальном времени;
- уведомление мастеру (швее) в Telegram о каждом заказе на пошив;
- аналитика: откуда пришли (соцсети, поиск, UTM-метки), страна, устройство; собирается только после согласия на cookies;
- админ-панель: заказы и смена статусов, аналитика с графиками; мастер сам добавляет и редактирует кукол, одежду и аксессуары (фото, цена, рост, волосы, глаза, коллекция, описание, «в наличии / на заказ»), а также вещи гардероба конструктора;
- страница товара с описанием;
- адаптивная вёрстка для телефона, планшета и компьютера;
- защита: RLS в базе, ровно один админ, капча Cloudflare Turnstile, лимит заказов, заголовки безопасности.

Без ключей в `.env` сайт запускается в **демо-режиме** на товарах из макета, так что посмотреть его можно сразу:

```bash
npm install
npm run dev      # http://localhost:5173
```

## Как залить в GitHub
```bash
cd doll-store
git remote add origin https://github.com/greverXD/Md-s-store.git
git push -u origin main
```
(Коммит уже сделан внутри архива. Папки `node_modules` нет — после клонирования выполните `npm install`.)

## Как мастеру добавить куклу
Админ-панель → **Товары** → **Куклы** → «+ Добавить куклу». Нажмите на квадрат, чтобы загрузить фото (JPG/PNG/WebP до 5 МБ),
заполните название, цену и характеристики, отметьте «В наличии» или оставьте выключенным, чтобы кукла продавалась «на заказ».
Кнопка «Изменить» на карточке открывает ту же форму; там же можно заменить фото, скрыть куклу с сайта или удалить её.
Фото хранятся в Supabase Storage (бакет `products`, создаётся миграцией). Загружать их может только админ.

---

## Запуск по шагам

### 1. Supabase: база данных
1. Откройте проект на [supabase.com](https://supabase.com) → **SQL Editor** → **New query**.
2. Вставьте целиком `supabase/migrations/20261121000000_init.sql` → **Run**.
3. Новый запрос: вставьте `supabase/seed.sql` → **Run** (демо-каталог из макета; потом замените товары на настоящие в админке).

### 2. Ключи сайта (`.env`)
Скопируйте `.env.example` в `.env` и заполните из **Project Settings → API**:
- `VITE_SUPABASE_URL` — Project URL
- `VITE_SUPABASE_ANON_KEY` — ключ `anon` / `publishable` (он публичный, это нормально)

⚠️ Ключ `service_role` **никогда** не кладите в переменные с префиксом `VITE_`, в код и в чат. Он нужен только серверу (шаг 6 и 7).

### 3. Вход через Google
1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → Create credentials → OAuth client ID → Web application.
2. Authorized redirect URI: `https://<ваш-проект>.supabase.co/auth/v1/callback`.
3. Client ID и Secret вставьте в Supabase → **Authentication → Providers → Google**.
4. Supabase → **Authentication → URL Configuration**: Site URL = адрес сайта, в Redirect URLs добавьте `http://localhost:5173/**` и `https://ваш-сайт/**`.

### 4. Назначить админа (один раз)
Зарегистрируйтесь на сайте, затем в SQL Editor:
```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'ваша@почта.ru');
```
Второго админа база не даст создать (уникальный индекс), а сменить роль через сайт невозможно. Только вручную через SQL Editor.

### 5. Бот для швеи в Telegram
1. В Telegram откройте **@BotFather** → `/newbot` → получите токен.
2. Швея пишет боту любое сообщение (например, `/start`).
3. Узнайте её chat_id: откройте в браузере `https://api.telegram.org/bot<ТОКЕН>/getUpdates` и найдите `"chat":{"id": ...}`.
   Несколько получателей можно указать через запятую.

### 6. Edge Function `create-order`
Через [Supabase CLI](https://supabase.com/docs/guides/cli):
```bash
npx supabase login
npx supabase link --project-ref <ref-проекта>
npx supabase secrets set TELEGRAM_BOT_TOKEN=... TELEGRAM_CHAT_ID=... SITE_URL=https://ваш-сайт.ru
npx supabase secrets set TURNSTILE_SECRET_KEY=...      # если включаете капчу
npx supabase secrets set TELEGRAM_NOTIFY_ALL=true      # если швее нужны ВСЕ заказы, а не только на пошив
npx supabase functions deploy create-order
```
`SUPABASE_URL` и `SUPABASE_SERVICE_ROLE_KEY` функция получает автоматически.

### 7. Хостинг на Vercel
1. [vercel.com](https://vercel.com) → Add New Project → импорт репозитория. Фреймворк Vite определится сам.
2. **Settings → Environment Variables**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_TURNSTILE_SITE_KEY`,
   а также серверные `SUPABASE_URL` и `SUPABASE_SERVICE_ROLE_KEY` (нужны для `/api/track`, страна берётся из заголовка Vercel).
3. Deploy. Статика раздаётся через CDN Vercel, поэтому наплыв посетителей сайт выдержит.

### 8. Капча (рекомендуется)
1. [Cloudflare → Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile) → Add site → получите Site Key и Secret Key.
2. Site Key → `VITE_TURNSTILE_SITE_KEY`; Secret → `supabase secrets set TURNSTILE_SECRET_KEY=...`.
3. Supabase → **Authentication → Attack Protection → Enable Captcha** → Turnstile → тот же Secret. Капча защитит регистрацию, вход и сброс пароля.

---

## Аналитика: что собираем и законно ли это
| Данные | Откуда | Нужно согласие? |
|---|---|---|
| Источник (Instagram, VK, Telegram, Google, Яндекс…) | `document.referrer` и UTM-метки | Да, собираем только после «Принять» в баннере |
| Страна | заголовок `x-vercel-ip-country`; **IP не сохраняется** | Да |
| Тип устройства, страницы | User-Agent, адрес страницы | Да |
| Имя, телефон, адрес | форма заказа | Согласие ставится галочкой при заказе |

Чтобы видеть рекламные кампании, добавляйте к ссылкам метки, например:
`https://ваш-сайт.ru/?utm_source=instagram&utm_campaign=new_year`.

**Юридически важно (152-ФЗ):** перед запуском нужна политика (шаблон на странице `/privacy`, заполните поля в `src/pages/PrivacyPage.tsx`) и уведомление Роскомнадзора об обработке ПДн. Данные граждан РФ при первичном сборе должны храниться в базе на территории РФ (ст. 18 ч. 5), а Supabase размещает серверы за рубежом. Это нужно обсудить с юристом. Вариант решения: перенести базу на российский хостинг (например, Supabase self-hosted в Yandex Cloud или Selectel).

## Защита: что сделано
- **RLS** на всех таблицах: покупатель видит только свои заказы; товары, статусы и аналитику меняет только админ.
- **Один админ:** уникальный индекс + роль нельзя поменять через API (права только на `full_name`, `phone`).
- **Заказы создаёт только сервер** (Edge Function): цены берутся из базы, подделать сумму из браузера нельзя.
- **Лимиты:** не больше 5 заказов в час на пользователя; встроенные лимиты Supabase Auth на вход и регистрацию (настраиваются в Authentication → Rate Limits).
- **Капча** Turnstile на входе, регистрации и заказе.
- **Подтверждение почты** при регистрации (включено в Supabase по умолчанию).
- **Заголовки безопасности** и кэширование статики в `vercel.json`.
- Если станет тесно на бесплатном тарифе Supabase (500 МБ базы, 50 000 активных пользователей в месяц), переходите на Pro за $25/мес.

## Структура
```
src/
  pages/            страницы (каталог, конструктор, корзина, кабинет, админка)
  components/       шапка, подвал, карточка товара, кукла SVG, баннер cookies, капча
  context/          авторизация и корзина
  lib/              Supabase-клиент, загрузка каталога, аналитика, типы
  data/demo.ts      данные из макета (демо-режим и seed)
api/track.ts        приём аналитики (Vercel Function)
supabase/
  migrations/       схема БД, RLS, отчёты аналитики
  functions/        create-order (заказ + Telegram)
  seed.sql          демо-каталог (npm run gen:seed)
```

## Обновление: «Сшить своими руками», «О мастере», «В наличии / На заказ»

- **Сшить куклу своими руками** (`/diy`): наборы для шитья, выкройки и мастер-классы. Товары добавляются в админке, вкладка «Своими руками».
  Перед этим один раз выполните в Supabase → SQL Editor файл `supabase/migrations/20261123000000_diy_and_about.sql`
  (а для демо-товаров этого раздела можно заново запустить `supabase/seed.sql`).
- **О мастере** (`/about`): тексты и фото лежат в `src/data/about.ts`, их можно поменять прямо там.
- **В наличии / На заказ**: у кукол и одежды есть подразделы-вкладки, а на каждой карточке видна метка.
  Статус переключается в админке галочкой «В наличии».
