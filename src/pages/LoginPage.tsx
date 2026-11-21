import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { isDemo, supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { EmptyState, Notice } from "@/components/ui";
import { Turnstile, captchaEnabled } from "@/components/Turnstile";

type Mode = "signin" | "signup" | "reset";

const ERRORS: Record<string, string> = {
  "Invalid login credentials": "Неверная почта или пароль.",
  "Email not confirmed": "Подтвердите почту: мы отправили письмо со ссылкой.",
  "User already registered": "Такой пользователь уже есть. Попробуйте войти.",
};
const translate = (m: string) => ERRORS[m] ?? (m.includes("rate limit") ? "Слишком много попыток. Подождите немного." : m);

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [agree, setAgree] = useState(false);
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? "/account";

  useEffect(() => { if (user) navigate(from, { replace: true }); }, [user, from, navigate]);

  if (isDemo || !supabase) return <EmptyState title="Вход появится после подключения Supabase" />;
  const sb = supabase;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null); setInfo(null);
    if (captchaEnabled && !captcha) { setError("Подтвердите, что вы не робот."); return; }
    setBusy(true);
    const captchaToken = captcha ?? undefined;
    try {
      if (mode === "signin") {
        const { error } = await sb.auth.signInWithPassword({ email, password, options: { captchaToken } });
        if (error) throw error;
      } else if (mode === "signup") {
        const { data, error } = await sb.auth.signUp({
          email, password,
          options: { captchaToken, data: { full_name: fullName, consent: agree }, emailRedirectTo: `${location.origin}/account` },
        });
        if (error) throw error;
        if (!data.session) setInfo("Готово! Проверьте почту и перейдите по ссылке, чтобы подтвердить адрес.");
      } else {
        const { error } = await sb.auth.resetPasswordForEmail(email, { captchaToken, redirectTo: `${location.origin}/reset-password` });
        if (error) throw error;
        setInfo("Если такой адрес зарегистрирован, мы отправили письмо со ссылкой для смены пароля.");
      }
    } catch (err) {
      setError(translate((err as Error).message));
      window.turnstile?.reset();
      setCaptcha(null);
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    // Согласие для Google-входа: кнопка неактивна до галочки.
    await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}${from}` } });
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-8">
        <p className="eyebrow">Личный кабинет</p>
        <h1 className="font-['Gilda_Display'] text-4xl text-[#3A2E27]">
          {mode === "signin" ? "Вход" : mode === "signup" ? "Регистрация" : "Восстановление пароля"}
        </h1>
      </div>

      <div className="card p-6 space-y-4">
        {mode !== "reset" && (
          <>
            <button onClick={google} disabled={mode === "signup" && !agree}
              className="w-full flex items-center justify-center gap-3 rounded-xl border py-2.5 font-['Jost'] text-sm font-medium text-[#3A2E27] hover:border-[#B8975A] transition-colors disabled:opacity-40">
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
              Войти через Google
            </button>
            <div className="flex items-center gap-3 text-xs text-[#8B7B6E] font-['Jost']">
              <div className="flex-1 h-px bg-[#BAA28A]/30" />или по почте<div className="flex-1 h-px bg-[#BAA28A]/30" />
            </div>
          </>
        )}

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <input className="input" placeholder="Как к вам обращаться" value={fullName} maxLength={100} onChange={e => setFullName(e.target.value)} />
          )}
          <input className="input" type="email" placeholder="Электронная почта" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
          {mode !== "reset" && (
            <input className="input" type="password" placeholder="Пароль" required minLength={8}
              autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={e => setPassword(e.target.value)} />
          )}
          {mode === "signup" && (
            <label className="flex gap-2 items-start text-xs font-['Jost'] text-[#8B7B6E] font-normal">
              <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} required className="mt-0.5 accent-[#B8975A]" />
              <span>Даю согласие на обработку персональных данных и принимаю <Link to="/privacy" className="text-[#B8975A] underline">политику конфиденциальности</Link></span>
            </label>
          )}
          <Turnstile onToken={setCaptcha} />
          {error && <Notice kind="error">{error}</Notice>}
          {info && <Notice kind="success">{info}</Notice>}
          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? "Подождите…" : mode === "signin" ? "Войти" : mode === "signup" ? "Зарегистрироваться" : "Отправить ссылку"}
          </button>
        </form>

        <div className="flex justify-between text-sm font-['Jost']">
          {mode === "signin" ? (
            <>
              <button onClick={() => setMode("signup")} className="text-[#B8975A]">Регистрация</button>
              <button onClick={() => setMode("reset")} className="text-[#8B7B6E]">Забыли пароль?</button>
            </>
          ) : (
            <button onClick={() => setMode("signin")} className="text-[#B8975A]">Уже есть аккаунт? Войти</button>
          )}
        </div>
        {mode === "signin" && (
          <p className="text-[11px] font-['Jost'] text-[#8B7B6E] leading-relaxed">
            Входя через Google, вы соглашаетесь с <Link to="/privacy" className="underline">политикой конфиденциальности</Link>.
          </p>
        )}
      </div>
    </div>
  );
}
