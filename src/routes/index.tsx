import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useProfile } from "@/hooks/useProfile";
import { GRADE_OPTIONS, isGradeValue, type GradeValue } from "@/lib/student-profile";

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
  const { data: profile, authLoading, saveProfile } = useProfile();
  const [name, setName] = useState("");
  const [grade, setGrade] = useState<GradeValue | "">("");

  useEffect(() => {
    if (!authLoading && profile) navigate({ to: "/dashboard" });
  }, [authLoading, profile, navigate]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const fullName = name.trim();
    if (fullName.split(/\s+/).length < 3) {
      toast.error("اكتب الاسم الثلاثي");
      return;
    }
    if (!grade) {
      toast.error("اختر المرحلة");
      return;
    }
    saveProfile({ full_name: fullName, grade });
    navigate({ to: "/dashboard" });
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
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="الاسم الثلاثي"
              className="w-full rounded-xl bg-white/70 px-4 py-3 text-sm ring-1 ring-black/5 outline-none placeholder:text-muted-foreground focus:ring-primary/40"
            />
            <select
              required
              value={grade}
              onChange={(e) => {
                const nextGrade = Number(e.target.value);
                setGrade(isGradeValue(nextGrade) ? nextGrade : "");
              }}
              className="w-full rounded-xl bg-white/70 px-4 py-3 text-sm ring-1 ring-black/5 outline-none placeholder:text-muted-foreground focus:ring-primary/40"
            >
              <option value="">اختر المرحلة</option>
              {GRADE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="mt-2 w-full rounded-2xl bg-primary py-3 text-[15px] font-bold text-primary-foreground ring-1 ring-primary transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              تسجيل الدخول
            </button>
          </form>
        </div>

        <div className="glass-card rise p-5">
          <h2 className="text-[17px] font-bold">شنو يقدر يسوي منهجنا؟</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>• يحل واجباتك ويشرحها خطوة خطوة.</li>
            <li>• يجاوب أي سؤال يخص دروسك.</li>
            <li>• امتحانات لكل مادة: سهل 10 أسئلة أو صعب 15 سؤال.</li>
          </ul>
        </div>

        <p className="font-plex pb-2 text-center text-[11px] text-muted-foreground">
          منهجنا · المنهج البحريني للمرحلة الإعدادية
        </p>
      </div>
    </div>
  );
}
