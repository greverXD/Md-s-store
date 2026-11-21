import { useEffect, useState } from "react";
import { supabase, isDemo } from "./supabase";
import { DEMO_OUTFIT_ITEMS, DEMO_PRODUCTS } from "@/data/demo";
import type { DollType, OutfitItem, Product, ProductKind } from "./types";

interface ProductRow {
  id: string; kind: ProductKind; doll_type: DollType | null; name: string; price: number; image_url: string | null;
  is_new: boolean; in_stock: boolean; category: string | null; height: string | null; hair_color: string | null;
  eye_color: string | null; collection: string | null; description?: string | null;
}
interface OutfitRow { id: string; doll_type: DollType; category: string; name: string; color: string; price: number; zone: OutfitItem["zone"]; sort: number }

export const mapProduct = (r: ProductRow): Product => ({
  id: r.id, kind: r.kind, dollType: r.doll_type, name: r.name, price: r.price, image: r.image_url ?? "",
  isNew: r.is_new, inStock: r.in_stock, category: r.category, height: r.height, hairColor: r.hair_color,
  eyeColor: r.eye_color, collection: r.collection, description: r.description ?? null,
});

interface Query { kind: ProductKind; dollType?: DollType | null }

/** Товары из Supabase (или из макета в демо-режиме). */
export function useProducts({ kind, dollType }: Query) {
  const [data, setData] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    if (isDemo || !supabase) {
      setData(DEMO_PRODUCTS.filter(p => p.kind === kind && (dollType === undefined || p.dollType === dollType)));
      return;
    }
    let q = supabase.from("products").select("*").eq("active", true).eq("kind", kind).order("created_at", { ascending: true });
    if (dollType) q = q.eq("doll_type", dollType);
    q.then(({ data, error }) => {
      if (cancelled) return;
      if (error) setError(error.message);
      else setData((data as ProductRow[]).map(mapProduct));
    });
    return () => { cancelled = true; };
  }, [kind, dollType]);

  return { data, error, loading: data === null && !error };
}

export function useOutfitItems(dollType: DollType | null) {
  const [data, setData] = useState<OutfitItem[] | null>(null);
  useEffect(() => {
    if (!dollType) return;
    setData(null);
    if (isDemo || !supabase) {
      setData(DEMO_OUTFIT_ITEMS.filter(o => o.dollType === dollType));
      return;
    }
    supabase.from("outfit_items").select("id, doll_type, category, name, color, price, zone, sort")
      .eq("active", true).eq("doll_type", dollType).order("sort")
      .then(({ data }) => setData(((data ?? []) as OutfitRow[]).map(r => ({
        id: r.id, dollType: r.doll_type, category: r.category, name: r.name, color: r.color, price: r.price, zone: r.zone, sort: r.sort,
      }))));
  }, [dollType]);
  return data;
}

/** Один товар по id (страница товара). */
export function useProduct(id: string | undefined) {
  const [data, setData] = useState<Product | null | undefined>(undefined);
  useEffect(() => {
    if (!id) return;
    setData(undefined);
    if (isDemo || !supabase) {
      setData(DEMO_PRODUCTS.find(p => p.id === id) ?? null);
      return;
    }
    if (!/^[0-9a-f-]{36}$/i.test(id)) { setData(null); return; }
    supabase.from("products").select("*").eq("id", id).eq("active", true).maybeSingle()
      .then(({ data }) => setData(data ? mapProduct(data as ProductRow) : null));
  }, [id]);
  return data;
}
