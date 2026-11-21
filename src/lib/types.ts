export type DollType = "textile" | "paola" | "nines" | "minikane";
export type OutfitZone = "head" | "body" | "top" | "bottom" | "feet" | "hand";
export type ProductKind = "doll" | "clothing" | "accessory";

export interface Product {
  id: string;
  kind: ProductKind;
  dollType: DollType | null;
  name: string;
  price: number;
  image: string;
  isNew: boolean;
  inStock: boolean;
  category: string | null;
  height: string | null;
  hairColor: string | null;
  eyeColor: string | null;
  collection: string | null;
  description?: string | null;
}

export interface OutfitItem {
  id: string;
  dollType: DollType;
  category: string;
  name: string;
  color: string;
  price: number;
  zone: OutfitZone;
  sort: number;
}

export type OrderStatus = "new" | "accepted" | "in_progress" | "shipped" | "delivered" | "cancelled";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  new: "Новый",
  accepted: "Принят мастером",
  in_progress: "В работе",
  shipped: "Отправлен",
  delivered: "Получен",
  cancelled: "Отменён",
};

export const ORDER_STATUS_FLOW: OrderStatus[] = ["new", "accepted", "in_progress", "shipped", "delivered"];

/** Позиция корзины: обычный товар или кукла, собранная в конструкторе. */
export type CartItem =
  | { key: string; type: "product"; productId: string; name: string; price: number; image: string; qty: number }
  | {
      key: string;
      type: "custom";
      dollType: DollType;
      name: string;
      price: number;
      qty: number;
      outfit: { zone: OutfitZone; itemId: string; name: string; color: string; price: number }[];
    };

export interface Contact {
  name: string;
  phone: string;
  address: string;
  comment: string;
}

export interface OrderRow {
  id: string;
  number: number;
  user_id: string;
  status: OrderStatus;
  total: number;
  is_custom: boolean;
  contact: Contact;
  created_at: string;
  updated_at: string;
  order_items: OrderItemRow[];
}

export interface OrderItemRow {
  id: string;
  kind: "product" | "custom";
  title: string;
  price: number;
  qty: number;
  config: { dollType?: DollType; outfit?: { zone: OutfitZone; name: string; color: string }[] } | null;
}
