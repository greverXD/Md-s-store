// Демо-данные из макета Figma. Используются:
//  1) как запасной каталог, пока Supabase не подключён (демо-режим);
//  2) как источник для supabase/seed.sql (npm run gen:seed).
import type { DollType, OutfitZone, Product } from "../lib/types.ts";

interface DemoProduct { id: string; name: string; price: number; image: string; isNew?: boolean; inStock: boolean; category?: string; description?: string; height?: string; hairColor?: string; eyeColor?: string; collection?: string; }
interface OutfitOption { name: string; color: string; price: number; zone: OutfitZone; }

// ─── Meta ─────────────────────────────────────────────────────────────────────
export const DOLL_META: Record<DollType, { label: string; shortLabel: string; desc: string; img: string; bg: string }> = {
  textile: {
    label: "Авторские текстильные куклы",
    shortLabel: "Авторские куклы",
    desc: "Уникальные куклы, созданные вручную с любовью",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=700&fit=crop&auto=format",
    bg: "#F5EAE0",
  },
  paola: {
    label: "Одежда для Paola Reina",
    shortLabel: "Paola Reina",
    desc: "Изысканные наряды для испанских красавиц",
    img: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&h=700&fit=crop&auto=format",
    bg: "#EAE5F0",
  },
  nines: {
    label: "Одежда для Nines d'Onil",
    shortLabel: "Nines d'Onil",
    desc: "Нежные образы для малышей",
    img: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=700&fit=crop&auto=format",
    bg: "#E8F0E8",
  },
  minikane: {
    label: "Одежда для MiniKane",
    shortLabel: "MiniKane",
    desc: "Стильные наряды для маленьких модниц",
    img: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&h=700&fit=crop&auto=format",
    bg: "#EEE8DF",
  },
};

// ─── Data ─────────────────────────────────────────────────────────────────────
export const COLLECTIONS = ["Лесная сказка", "Зимняя история", "Весенний сон", "Летний полдень"];
export const HAIR_COLORS = ["Светлые", "Русые", "Тёмные", "Рыжие", "Белые"];
export const EYE_COLORS = ["Голубые", "Карие", "Зелёные", "Серые"];
export const HEIGHTS = ["30 см", "35 см", "40 см", "45 см", "50 см"];

const DOLL_IMGS = [
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=500&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=500&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=500&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=500&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=500&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=500&fit=crop&auto=format",
];

const CLOTH_IMGS = [
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=480&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=480&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&h=480&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=480&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=400&h=480&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=480&fit=crop&auto=format",
];

const TEXTILE_DOLLS: DemoProduct[] = [
  "Аврора", "Беллочка", "Василиса", "Дарья", "Елизавета",
  "Жасмин", "Зара", "Ирина", "Катенька", "Лада", "Маруся", "Настенька",
].map((name, i) => ({
  id: `d${i}`,
  name,
  price: [4800, 5200, 5800, 6400, 7000, 7500, 8200, 9000, 9800, 12000, 6800, 7200][i],
  image: DOLL_IMGS[i % DOLL_IMGS.length],
  isNew: i < 3,
  inStock: i % 5 !== 3,
  height: HEIGHTS[i % HEIGHTS.length],
  hairColor: HAIR_COLORS[i % HAIR_COLORS.length],
  eyeColor: EYE_COLORS[i % EYE_COLORS.length],
  collection: COLLECTIONS[i % COLLECTIONS.length],
}));

export const CLOTHING_CATS: Record<DollType, string[]> = {
  textile: ["Платья", "Пальто", "Юбки", "Брюки", "Кофты", "Береты", "Обувь"],
  paola: ["Платья", "Пальто", "Юбки", "Брюки", "Свитера", "Кофточки", "Комбинезоны", "Пижамы", "Береты", "Шапочки", "Обувь"],
  nines: ["Платья", "Песочники", "Комбинезоны", "Пижамы", "Курточки", "Обувь", "Головные уборы"],
  minikane: ["Платья", "Юбки", "Брюки", "Свитера", "Кардиганы", "Куртки", "Обувь", "Береты", "Аксессуары"],
};

const SUFFIXES = ["«Романс»", "«Прованс»", "«Сказка»", "«Нежность»", "«Весна»"];

function makeClothing(t: DollType): DemoProduct[] {
  return CLOTHING_CATS[t].flatMap((cat, ci) =>
    [0, 1, 2].map(j => ({
      id: `${t}-c${ci}-${j}`,
      name: `${cat} ${SUFFIXES[(ci + j) % SUFFIXES.length]}`,
      price: [890, 1200, 1450, 1600, 1800][(ci + j) % 5],
      image: CLOTH_IMGS[(ci * 2 + j) % CLOTH_IMGS.length],
      isNew: ci === 0 && j === 0,
      inStock: (ci + j) % 4 !== 2,
      category: cat,
    }))
  );
}

const CLOTHING: Record<DollType, DemoProduct[]> = {
  textile: makeClothing("textile"),
  paola: makeClothing("paola"),
  nines: makeClothing("nines"),
  minikane: makeClothing("minikane"),
};

export const ACC_CATS = ["Игрушки", "Сумочки", "Чемоданы", "Венки", "Цветы", "Корзинки", "Книги", "Мебель", "Подушки", "Декор"];
const ACCESSORIES: DemoProduct[] = ACC_CATS.flatMap((cat, ci) =>
  [0, 1, 2].map(j => ({
    id: `a${ci}-${j}`,
    name: `${cat} ${SUFFIXES[(ci + j) % SUFFIXES.length]}`,
    price: [450, 680, 890, 1200, 1450][(ci + j) % 5],
    image: CLOTH_IMGS[(ci + j) % CLOTH_IMGS.length],
    isNew: ci < 2 && j === 0,
    inStock: (ci + j) % 5 !== 1,
    category: cat,
  }))
);

// ─── Сшить куклу своими руками ─────────────────────────────────────────────────
export const DIY_CATS = ["Наборы для шитья", "Выкройки", "Мастер-классы"];
const DIY_IMGS = [
  "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400&h=500&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1528578577235-b963df6db908?w=400&h=500&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=400&h=500&fit=crop&auto=format",
];
const DIY: DemoProduct[] = [
  { id: "diy0", category: "Наборы для шитья", name: "Набор «Первая кукла», 30 см", price: 2400, isNew: true, inStock: true,
    description: "Всё для первой куклы: выкройка, ткань для тела, наполнитель, нитки, волосы, ткань на платье и пошаговая инструкция с фото." },
  { id: "diy1", category: "Наборы для шитья", name: "Набор «Лесная фея», 40 см", price: 3200, inStock: true,
    description: "Набор с выкройкой куклы и наряда феи, льняной тканью, шерстью для волос и подробным видеоуроком." },
  { id: "diy2", category: "Наборы для шитья", name: "Набор «Зимняя история», 45 см", price: 3600, inStock: false,
    description: "Комплектуется под заказ: подберём ткани и цвет волос по вашему желанию." },
  { id: "diy3", category: "Выкройки", name: "Выкройка куклы 35 см (PDF)", price: 650, inStock: true,
    description: "Электронная выкройка в натуральную величину и инструкция по сборке. Отправим на почту после оплаты." },
  { id: "diy4", category: "Выкройки", name: "Выкройки одежды: платье, пальто, берет", price: 550, isNew: true, inStock: true,
    description: "Комплект выкроек базового гардероба для куклы 35–40 см." },
  { id: "diy5", category: "Выкройки", name: "Выкройка «Зайка в платье»", price: 450, inStock: true,
    description: "Выкройка интерьерной игрушки-зайки с нарядом." },
  { id: "diy6", category: "Мастер-классы", name: "Видео мастер-класс «Кукла с нуля»", price: 2900, inStock: true,
    description: "Запись мастер-класса: от раскроя до росписи лица. Доступ навсегда, вопросы мастеру в чате." },
  { id: "diy7", category: "Мастер-классы", name: "Личный онлайн-урок с мастером", price: 3500, inStock: false,
    description: "Индивидуальное занятие по видеосвязи, 2 часа. Время согласуем после заказа." },
].map((p, i) => ({ ...p, image: DIY_IMGS[i % DIY_IMGS.length] }));

// ─── Outfit Builder Data ───────────────────────────────────────────────────────
export const OUTFIT_CATS: Record<DollType, string[]> = {
  textile: ["Платья", "Пальто", "Юбки", "Брюки", "Кофты", "Береты", "Обувь", "Игрушки", "Сумочки", "Аксессуары"],
  paola: ["Платья", "Брюки", "Юбки", "Куртки", "Свитера", "Пижамы", "Береты", "Обувь", "Игрушки", "Сумочки"],
  nines: ["Комбинезоны", "Песочники", "Пижамы", "Платья", "Обувь", "Шапочки", "Игрушки"],
  minikane: ["Платья", "Брюки", "Юбки", "Кардиганы", "Куртки", "Береты", "Обувь", "Игрушки", "Сумочки"],
};

export const OUTFIT_ITEMS: Record<DollType, Record<string, OutfitOption[]>> = {
  textile: {
    Платья: [
      { name: "Лесная фея", color: "#D4B8C7", price: 890, zone: "body" },
      { name: "Ромашка", color: "#F0E8A0", price: 980, zone: "body" },
      { name: "Закат", color: "#F0C0A0", price: 1050, zone: "body" },
    ],
    Пальто: [
      { name: "Осень", color: "#C8A87A", price: 1600, zone: "top" },
      { name: "Уют", color: "#A0B8C0", price: 1800, zone: "top" },
    ],
    Юбки: [
      { name: "Балерина", color: "#F0D0D8", price: 680, zone: "bottom" },
      { name: "Луговая", color: "#C0D8B0", price: 750, zone: "bottom" },
    ],
    Брюки: [
      { name: "Классика", color: "#8090A8", price: 680, zone: "bottom" },
      { name: "Клетка", color: "#D0C0A8", price: 750, zone: "bottom" },
    ],
    Кофты: [
      { name: "Вязаная", color: "#C8B0A0", price: 890, zone: "top" },
      { name: "Полоска", color: "#D0D8E0", price: 780, zone: "top" },
    ],
    Береты: [
      { name: "Шерсть", color: "#C07070", price: 450, zone: "head" },
      { name: "Бежевый", color: "#D8C8B0", price: 450, zone: "head" },
    ],
    Обувь: [
      { name: "Туфельки", color: "#303030", price: 580, zone: "feet" },
      { name: "Ботинки", color: "#806040", price: 680, zone: "feet" },
    ],
    Игрушки: [
      { name: "Тедди", color: "#D8B888", price: 380, zone: "hand" },
      { name: "Зайка", color: "#E0D0D0", price: 350, zone: "hand" },
    ],
    Сумочки: [
      { name: "Плетёная", color: "#C8A870", price: 480, zone: "hand" },
      { name: "Рюкзачок", color: "#B8C8D8", price: 450, zone: "hand" },
    ],
    Аксессуары: [
      { name: "Венок", color: "#98C878", price: 380, zone: "head" },
      { name: "Корзинка", color: "#C8A870", price: 320, zone: "hand" },
    ],
  },
  paola: {
    Платья: [
      { name: "Розовая мечта", color: "#F0B8C8", price: 1200, zone: "body" },
      { name: "Летний сад", color: "#B8D8B0", price: 1100, zone: "body" },
      { name: "Принцесса", color: "#D0C0E8", price: 1400, zone: "body" },
    ],
    Брюки: [
      { name: "Бежевые", color: "#D8C8A8", price: 890, zone: "bottom" },
      { name: "Джинсы", color: "#8090B8", price: 950, zone: "bottom" },
    ],
    Юбки: [
      { name: "Плиссе", color: "#E8D0D8", price: 780, zone: "bottom" },
      { name: "Миди", color: "#C0D0C0", price: 850, zone: "bottom" },
    ],
    Куртки: [
      { name: "Пудра", color: "#E8D0C8", price: 1600, zone: "top" },
      { name: "Джинсовка", color: "#8898B8", price: 1400, zone: "top" },
    ],
    Свитера: [
      { name: "Мохер", color: "#E0B0B8", price: 1100, zone: "top" },
      { name: "Зима", color: "#D0D8E8", price: 1200, zone: "top" },
    ],
    Пижамы: [
      { name: "Звёзды", color: "#D0C0E0", price: 1200, zone: "body" },
      { name: "Клубника", color: "#F0B0C0", price: 1100, zone: "body" },
    ],
    Береты: [
      { name: "Красный", color: "#C04040", price: 480, zone: "head" },
      { name: "Горчица", color: "#C8A040", price: 480, zone: "head" },
    ],
    Обувь: [
      { name: "Туфли", color: "#201818", price: 680, zone: "feet" },
      { name: "Кеды", color: "#F0F0E8", price: 650, zone: "feet" },
    ],
    Игрушки: [
      { name: "Мишка", color: "#D8B880", price: 380, zone: "hand" },
      { name: "Кукла", color: "#F0D0C0", price: 450, zone: "hand" },
    ],
    Сумочки: [
      { name: "Кожа", color: "#806050", price: 580, zone: "hand" },
      { name: "Корзинка", color: "#C8A870", price: 480, zone: "hand" },
    ],
  },
  nines: {
    Комбинезоны: [
      { name: "Мишки", color: "#D8C0A8", price: 1100, zone: "body" },
      { name: "Звёздочки", color: "#C0C8E8", price: 1200, zone: "body" },
    ],
    Песочники: [
      { name: "Морской", color: "#A0C8D8", price: 890, zone: "body" },
      { name: "Ромашка", color: "#F0E8A8", price: 850, zone: "body" },
    ],
    Пижамы: [
      { name: "Зайки", color: "#E8D8E8", price: 980, zone: "body" },
      { name: "Месяц", color: "#D0D8F0", price: 920, zone: "body" },
    ],
    Платья: [
      { name: "Нежность", color: "#F0D0D8", price: 1000, zone: "body" },
      { name: "Облачко", color: "#E8EEF8", price: 950, zone: "body" },
    ],
    Обувь: [
      { name: "Пинетки-зайка", color: "#E0C8B8", price: 480, zone: "feet" },
      { name: "Пинетки-звёздочка", color: "#D8D0E8", price: 480, zone: "feet" },
    ],
    Шапочки: [
      { name: "Мишка", color: "#D8C0A8", price: 380, zone: "head" },
      { name: "Помпон", color: "#C8D8C0", price: 350, zone: "head" },
    ],
    Игрушки: [
      { name: "Погремушка", color: "#F0D0A8", price: 280, zone: "hand" },
      { name: "Мягкий куб", color: "#D8E8D0", price: 350, zone: "hand" },
    ],
  },
  minikane: {
    Платья: [
      { name: "Фея", color: "#E8C8D8", price: 1100, zone: "body" },
      { name: "Луговое", color: "#C8E0B8", price: 1000, zone: "body" },
    ],
    Брюки: [
      { name: "Вельвет", color: "#8898A8", price: 850, zone: "bottom" },
      { name: "Скинни", color: "#7088A8", price: 890, zone: "bottom" },
    ],
    Юбки: [
      { name: "Солнце", color: "#F0D8C0", price: 750, zone: "bottom" },
      { name: "Тюль", color: "#E8D8F0", price: 800, zone: "bottom" },
    ],
    Кардиганы: [
      { name: "Мохер", color: "#D8C0B8", price: 1100, zone: "top" },
      { name: "Клетка", color: "#D0C8A8", price: 1200, zone: "top" },
    ],
    Куртки: [
      { name: "Пузырёк", color: "#B8C8D8", price: 1400, zone: "top" },
      { name: "Кожа", color: "#606060", price: 1600, zone: "top" },
    ],
    Береты: [
      { name: "Горчица", color: "#C8A040", price: 450, zone: "head" },
      { name: "Малина", color: "#C04870", price: 450, zone: "head" },
    ],
    Обувь: [
      { name: "Мэри-джейн", color: "#201818", price: 680, zone: "feet" },
      { name: "Лоферы", color: "#604830", price: 720, zone: "feet" },
    ],
    Игрушки: [
      { name: "Зайка", color: "#E8D0C8", price: 380, zone: "hand" },
      { name: "Котик", color: "#D0C8C0", price: 380, zone: "hand" },
    ],
    Сумочки: [
      { name: "Крокодил", color: "#708060", price: 580, zone: "hand" },
      { name: "Бочонок", color: "#D8C0A0", price: 520, zone: "hand" },
    ],
  },
};


export const DOLL_TYPES: DollType[] = ["textile", "paola", "nines", "minikane"];

const toProduct = (p: DemoProduct, kind: Product["kind"], dollType: DollType | null): Product => ({
  id: p.id, kind, dollType, name: p.name, price: p.price, image: p.image,
  isNew: !!p.isNew, inStock: p.inStock, category: p.category ?? null,
  height: p.height ?? null, hairColor: p.hairColor ?? null, eyeColor: p.eyeColor ?? null, collection: p.collection ?? null,
  description: p.description ?? null,
});

export const DEMO_PRODUCTS: Product[] = [
  ...TEXTILE_DOLLS.map(p => toProduct(p, "doll", "textile")),
  ...DOLL_TYPES.flatMap(t => CLOTHING[t].map(p => toProduct(p, "clothing", t))),
  ...ACCESSORIES.map(p => toProduct(p, "accessory", null)),
  ...DIY.map(p => toProduct(p, "diy", null)),
];

export const DEMO_OUTFIT_ITEMS = DOLL_TYPES.flatMap(t =>
  OUTFIT_CATS[t].flatMap((cat, ci) =>
    (OUTFIT_ITEMS[t][cat] ?? []).map((o, j) => ({
      id: `${t}-o${ci}-${j}`, dollType: t, category: cat, name: o.name, color: o.color, price: o.price, zone: o.zone, sort: ci * 10 + j,
    }))
  )
);
