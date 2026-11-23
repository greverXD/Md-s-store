// Генерирует supabase/seed.sql из демо-данных макета (src/data/demo.ts).
// Запуск: npm run gen:seed
import { writeFileSync } from "node:fs";
import { DEMO_PRODUCTS, DEMO_OUTFIT_ITEMS } from "../src/data/demo.ts";

const q = (v: unknown) =>
  v === null || v === undefined ? "null" : typeof v === "number" || typeof v === "boolean" ? String(v) : `'${String(v).replace(/'/g, "''")}'`;

const products = DEMO_PRODUCTS.map(p =>
  `(${[p.id, p.kind, p.dollType, p.category, p.name, p.price, p.image, p.isNew, p.inStock, p.height, p.hairColor, p.eyeColor, p.collection, p.description].map(q).join(", ")})`
).join(",\n");

const outfit = DEMO_OUTFIT_ITEMS.map(o =>
  `(${[o.id, o.dollType, o.category, o.name, o.color, o.price, o.zone, o.sort].map(q).join(", ")})`
).join(",\n");

const sql = `-- Демо-каталог из макета Figma. Сгенерировано scripts/gen-seed.ts.
-- Запуск: SQL Editor → Run (после миграции). Повторный запуск безопасен.
insert into public.products (slug, kind, doll_type, category, name, price, image_url, is_new, in_stock, height, hair_color, eye_color, collection, description) values
${products}
on conflict (slug) do nothing;

insert into public.outfit_items (slug, doll_type, category, name, color, price, zone, sort) values
${outfit}
on conflict (slug) do nothing;
`;
writeFileSync(new URL("../supabase/seed.sql", import.meta.url), sql);
console.log(`seed.sql: ${DEMO_PRODUCTS.length} products, ${DEMO_OUTFIT_ITEMS.length} outfit items`);
