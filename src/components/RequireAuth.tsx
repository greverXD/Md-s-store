import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { isDemo } from "@/lib/supabase";
import { EmptyState, Spinner } from "./ui";

export function RequireAuth({ children, admin }: { children: ReactNode; admin?: boolean }) {
  const { user, isAdmin, loading, profile } = useAuth();
  const location = useLocation();
  if (isDemo) return <EmptyState title="Нужен Supabase" text="Заполните ключи в .env, чтобы включить вход и личный кабинет." />;
  if (loading || (user && admin && !profile)) return <Spinner />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (admin && !isAdmin) return <EmptyState title="Доступ запрещён" text="Этот раздел только для администратора." />;
  return <>{children}</>;
}
