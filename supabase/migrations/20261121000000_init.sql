-- =====================================================================
--  Кукольный Дом — схема базы данных
--  Запуск: Supabase Dashboard → SQL Editor → вставить файл целиком → Run
--  (или `supabase db push`, если используете Supabase CLI)
-- =====================================================================

create extension if not exists pgcrypto;

-- ─── Профили и роли ──────────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  phone       text,
  role        text not null default 'customer' check (role in ('customer', 'admin')),
  consent_at  timestamptz,          -- когда пользователь дал согласие на обработку ПДн
  created_at  timestamptz not null default now()
);

-- Админ может быть только один: уникальный индекс по role только для 'admin'.
create unique index profiles_single_admin on public.profiles ((role)) where role = 'admin';

-- Профиль создаётся автоматически при регистрации (email или Google).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, consent_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    case when (new.raw_user_meta_data->>'consent') = 'true' then now() else null end
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Проверка «текущий пользователь — админ». security definer, чтобы не
-- зацикливаться на RLS таблицы profiles.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

alter table public.profiles enable row level security;

create policy "profiles: read own or admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

create policy "profiles: update own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Пользователь может менять только имя и телефон. Колонку role через API
-- не изменить никому — даже админу. Назначение админа только через SQL Editor.
revoke update on public.profiles from authenticated, anon;
grant update (full_name, phone) on public.profiles to authenticated;

-- ─── Каталог ─────────────────────────────────────────────────────────
create table public.products (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique,
  kind        text not null check (kind in ('doll', 'clothing', 'accessory')),
  doll_type   text check (doll_type in ('textile', 'paola', 'nines', 'minikane')),
  category    text,
  name        text not null,
  description text,
  price       integer not null check (price >= 0),   -- в рублях
  image_url   text,
  is_new      boolean not null default false,
  in_stock    boolean not null default true,
  height      text,
  hair_color  text,
  eye_color   text,
  collection  text,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);
create index products_kind_idx on public.products (kind, doll_type) where active;

-- Вещи «гардероба» для конструктора
create table public.outfit_items (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique,
  doll_type   text not null check (doll_type in ('textile', 'paola', 'nines', 'minikane')),
  category    text not null,
  name        text not null,
  color       text not null default '#E8DDD0',
  image_url   text,                                   -- PNG-слой поверх куклы (необязательно)
  price       integer not null check (price >= 0),
  zone        text not null check (zone in ('head', 'body', 'top', 'bottom', 'feet', 'hand')),
  sort        integer not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.outfit_items enable row level security;

create policy "products: public read" on public.products for select using (active or public.is_admin());
create policy "products: admin write" on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy "outfit: public read" on public.outfit_items for select using (active or public.is_admin());
create policy "outfit: admin write" on public.outfit_items for all using (public.is_admin()) with check (public.is_admin());

-- ─── Заказы ──────────────────────────────────────────────────────────
create type public.order_status as enum ('new', 'accepted', 'in_progress', 'shipped', 'delivered', 'cancelled');

create table public.orders (
  id          uuid primary key default gen_random_uuid(),
  number      bigint generated always as identity,
  user_id     uuid not null references auth.users(id) on delete restrict,
  status      public.order_status not null default 'new',
  total       integer not null check (total >= 0),
  is_custom   boolean not null default false,          -- есть кукла из конструктора
  contact     jsonb not null,                          -- {name, phone, address, comment}
  admin_note  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index orders_user_idx on public.orders (user_id, created_at desc);
create index orders_created_idx on public.orders (created_at desc);

create table public.order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  product_id  uuid references public.products(id) on delete set null,
  kind        text not null check (kind in ('product', 'custom')),
  title       text not null,
  price       integer not null check (price >= 0),
  qty         integer not null default 1 check (qty between 1 and 20),
  config      jsonb                                     -- состав куклы из конструктора
);
create index order_items_order_idx on public.order_items (order_id);

create table public.order_status_history (
  id          bigint generated always as identity primary key,
  order_id    uuid not null references public.orders(id) on delete cascade,
  status      public.order_status not null,
  changed_at  timestamptz not null default now()
);

create or replace function public.track_order_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.order_status_history (order_id, status) values (new.id, new.status);
  end if;
  new.updated_at := now();
  return new;
end $$;

create trigger orders_status_history
  before insert or update on public.orders
  for each row execute function public.track_order_status();

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;

-- Покупатель видит только свои заказы. Создаются заказы ТОЛЬКО через
-- Edge Function create-order (service role), поэтому insert-политики нет:
-- нельзя подделать цену из браузера.
create policy "orders: read own or admin" on public.orders
  for select using (user_id = auth.uid() or public.is_admin());
create policy "orders: admin update" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

create policy "order_items: read own or admin" on public.order_items
  for select using (exists (
    select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())
  ));

create policy "status_history: read own or admin" on public.order_status_history
  for select using (exists (
    select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())
  ));

-- Обновление статуса в личном кабинете в реальном времени (RLS действует и тут).
alter publication supabase_realtime add table public.orders;

-- Админ меняет только статус и заметку.
revoke update on public.orders from authenticated, anon;
grant update (status, admin_note) on public.orders to authenticated;

-- ─── Аналитика посещений ─────────────────────────────────────────────
-- Пишется только сервером (api/track), только после согласия на cookies.
-- IP-адрес НЕ хранится — только страна.
create table public.visits (
  id            bigint generated always as identity primary key,
  created_at    timestamptz not null default now(),
  session_id    text not null,
  user_id       uuid references auth.users(id) on delete set null,
  path          text,
  source        text not null,          -- instagram / vk / telegram / google / yandex / direct / other
  referrer_host text,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  country       text,                   -- ISO-код страны по IP (сам IP не сохраняется)
  device        text                    -- mobile / desktop / tablet
);
create index visits_created_idx on public.visits (created_at desc);

alter table public.visits enable row level security;
create policy "visits: admin read" on public.visits for select using (public.is_admin());

-- Отчёты для админ-панели
create or replace function public.analytics_summary(days integer default 30)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  since timestamptz := now() - make_interval(days => greatest(1, least(days, 365)));
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'visits',    (select count(*) from visits where created_at >= since),
    'sessions',  (select count(distinct session_id) from visits where created_at >= since),
    'orders',    (select count(*) from orders where created_at >= since and status <> 'cancelled'),
    'revenue',   (select coalesce(sum(total), 0) from orders where created_at >= since and status <> 'cancelled'),
    'signups',   (select count(*) from profiles where created_at >= since),
    'daily',     (select coalesce(jsonb_agg(d order by d.day), '[]') from (
                    select to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as day,
                           count(distinct session_id) as sessions
                    from visits where created_at >= since group by 1) d),
    'sources',   (select coalesce(jsonb_agg(s order by s.sessions desc), '[]') from (
                    select source, count(distinct session_id) as sessions
                    from visits where created_at >= since group by 1) s),
    'countries', (select coalesce(jsonb_agg(c order by c.sessions desc), '[]') from (
                    select coalesce(country, '??') as country, count(distinct session_id) as sessions
                    from visits where created_at >= since group by 1 limit 20) c),
    'campaigns', (select coalesce(jsonb_agg(c order by c.sessions desc), '[]') from (
                    select utm_campaign as campaign, utm_source as source, count(distinct session_id) as sessions
                    from visits where created_at >= since and utm_campaign is not null group by 1, 2 limit 20) c),
    'devices',   (select coalesce(jsonb_agg(d order by d.sessions desc), '[]') from (
                    select coalesce(device, 'unknown') as device, count(distinct session_id) as sessions
                    from visits where created_at >= since group by 1) d)
  ) into result;

  return result;
end $$;

revoke execute on function public.analytics_summary(integer) from anon;

-- Автоудаление сырых посещений старше 13 месяцев (минимизация данных).
-- Включите расширение pg_cron в Dashboard → Database → Extensions и раскомментируйте:
-- select cron.schedule('purge-visits', '0 3 * * *', $$delete from public.visits where created_at < now() - interval '13 months'$$);

-- ─── Хранилище картинок ──────────────────────────────────────────────
insert into storage.buckets (id, name, public) values ('products', 'products', true)
  on conflict (id) do nothing;

create policy "products bucket: public read" on storage.objects
  for select using (bucket_id = 'products');
create policy "products bucket: admin write" on storage.objects
  for insert with check (bucket_id = 'products' and public.is_admin());
create policy "products bucket: admin update" on storage.objects
  for update using (bucket_id = 'products' and public.is_admin());
create policy "products bucket: admin delete" on storage.objects
  for delete using (bucket_id = 'products' and public.is_admin());
