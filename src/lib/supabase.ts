import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Нет ключей в .env → сайт работает в демо-режиме на данных из макета. */
export const isDemo = !url || !anonKey;

export const supabase: SupabaseClient | null = isDemo
  ? null
  : createClient(url!, anonKey!, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });

export function requireSupabase(): SupabaseClient {
  if (!supabase) throw new Error("Supabase не настроен: заполните VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в .env");
  return supabase;
}
