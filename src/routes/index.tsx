import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "منهجنا — مساعد طلاب المرحلة الإعدادية في البحرين" },
      {
        name: "description",
        content:
          "منهجنا يساعد طلاب الصف السابع والثامن والتاسع على حل الواجبات والإجابة عن الأسئلة مع امتحانات سهلة وصعبة.",
      },
      { property: "og:title", content: "منهجنا — مساعدك الدراسي الذكي" },
      {
        property: "og:description",
        content: "حل الواجبات، اسأل المساعد الذكي، واختبر نفسك حسب المنهج البحريني.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/dashboard" });
  }, [loading, session, navigate]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success("تم إنشاء الحساب! تحقق من بريدك لتأكيد التسجيل.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذّر إكمال العملية");
    } finally {
      setBusy(false);
    }
  };

  const googleSignIn = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("تعذّر الدخول عبر Google");
      return;
    }
  };

  return (
    <div className="flex min-h-screen justify-center p-4">
      <div className="flex w-full max-w-[430px] flex-col gap-4 py-6">
        <div className="relative overflow-hidden rounded-[24px] border border-border/70 bg-primary/10 px-5 py-6 ring-1 ring-white/70 backdrop-blur-xl">
          <div className="absolute -top-10 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-white/40 blur-3xl" />
          <div className="absolute -bottom-16 right-2 h-40 w-40 rounded-full bg-primary/25 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-[30px] leading-tight font-black">منهجنا</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                المنهج البحريني · للمرحلة الإعدادية
              </p>
            </div>
            <span className="grid size-11 place-items-center rounded-2xl bg-white/60 text-lg font-black text-primary ring-1 ring-white/70">
              م
            </span>
          </div>

          <form onSubmit={submit} className="relative mt-6 space-y-2">
            {mode === "signup" && (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اسمك"
                className="w-full rounded-xl bg-white/70 px-4 py-3 text-sm ring-1 ring-black/5 outline-none placeholder:text-muted-foreground focus:ring-primary/40"
              />
            )}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="البريد الإلكتروني"
              className="w-full rounded-xl bg-white/70 px-4 py-3 text-sm ring-1 ring-black/5 outline-none placeholder:text-muted-foreground focus:ring-primary/40"
            />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة المرور"
              className="w-full rounded-xl bg-white/70 px-4 py-3 text-sm ring-1 ring-black/5 outline-none placeholder:text-muted-foreground focus:ring-primary/40"
            />
            <button
              type="submit"
              disabled={busy}
              className="mt-2 w-full rounded-2xl bg-primary py-3 text-[15px] font-bold text-primary-foreground ring-1 ring-primary transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {busy ? "لحظة..." : mode === "signin" ? "تسجيل الدخول" : "إنشاء حساب"}
            </button>
          </form>

          <button
            onClick={googleSignIn}
            className="relative mt-2 w-full rounded-2xl bg-white/70 py-3 text-[15px] font-bold ring-1 ring-black/5 transition-colors hover:bg-white"
          >
            المتابعة عبر Google
          </button>

          <p className="relative mt-3 text-center text-[13px] text-muted-foreground">
            {mode === "signin" ? "جديد؟ " : "عندك حساب؟ "}
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="font-bold text-primary"
            >
              {mode === "signin" ? "إنشاء حساب" : "تسجيل الدخول"}
            </button>
          </p>
        </div>

        <div className="glass-card rise p-5">
          <h2 className="text-[17px] font-bold">شنو يقدر يسوي منهجنا؟</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>• يحل واجباتك ويشرحها خطوة خطوة.</li>
            <li>• يجاوب أي سؤال يخص دروسك.</li>
            <li>• امتحانات قصيرة تختار مستواها: سهل أو صعب.</li>
          </ul>
        </div>

        <p className="font-plex pb-2 text-center text-[11px] text-muted-foreground">
          منهجنا · المنهج البحريني للمرحلة الإعدادية
        </p>
      </div>
    </div>
  );
}
