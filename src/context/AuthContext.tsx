import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface Profile { id: string; full_name: string | null; phone: string | null; role: "customer" | "admin" }

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(!!supabase);

  const loadProfile = async (userId: string | undefined) => {
    if (!supabase || !userId) { setProfile(null); return; }
    const { data } = await supabase.from("profiles").select("id, full_name, phone, role").eq("id", userId).maybeSingle();
    setProfile((data as Profile) ?? null);
  };

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      await loadProfile(data.session?.user.id);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      // не await внутри колбэка — рекомендация supabase-js
      setTimeout(() => loadProfile(s?.user.id), 0);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value: AuthState = {
    user: session?.user ?? null,
    session,
    profile,
    // Это только для показа интерфейса. Реальная защита — RLS в базе.
    isAdmin: profile?.role === "admin",
    loading,
    refreshProfile: () => loadProfile(session?.user.id),
    signOut: async () => { await supabase?.auth.signOut(); setProfile(null); },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside AuthProvider");
  return v;
}
