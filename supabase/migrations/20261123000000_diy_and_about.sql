-- Раздел «Сшить куклу своими руками»: новый вид товара 'diy'
-- (наборы для шитья, выкройки, мастер-классы).
-- Запуск: SQL Editor → Run (после первой миграции). Повторный запуск безопасен.
alter table public.products drop constraint if exists products_kind_check;
alter table public.products
  add constraint products_kind_check check (kind in ('doll', 'clothing', 'accessory', 'diy'));
