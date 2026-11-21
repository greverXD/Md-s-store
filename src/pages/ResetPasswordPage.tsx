import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Notice } from "@/components/ui";

// Сюда ведёт ссылка из письма «Сменить пароль».
export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError(error.message);
    else navigate("/account");
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-['Gilda_Display'] text-3xl text-[#3A2E27] text-center mb-8">Новый пароль</h1>
      <form onSubmit={submit} className="card p-6 space-y-3">
        <input className="input" type="password" placeholder="Новый пароль (от 8 символов)" minLength={8} required
          autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <Notice kind="error">{error}</Notice>}
        <button className="btn-primary w-full">Сохранить</button>
      </form>
    </div>
  );
}
