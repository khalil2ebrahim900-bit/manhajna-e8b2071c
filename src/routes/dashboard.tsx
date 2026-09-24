import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { AppHeader } from "@/components/AppHeader";
import { GRADE_LABELS, useProfile } from "@/hooks/useProfile";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "صفحتي — منهجنا" },
      {
        name: "description",
        content: "ابدأ حل الواجبات مع المساعد الذكي أو اختبر نفسك في امتحان قصير.",
      },
      { property: "og:title", content: "صفحتي — منهجنا" },
      { property: "og:description", content: "مساعد الواجبات والامتحانات في مكان واحد." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const { data: profile, authLoading } = useProfile();

  useEffect(() => {
    if (!authLoading && !profile) navigate({ to: "/" });
  }, [authLoading, profile, navigate]);

  const greeting = profile?.full_name ? `مرحباً ${profile.full_name} 👋` : "أهلاً وسهلاً 👋";

  return (
    <div className="flex min-h-screen justify-center p-4">
      <div className="flex w-full max-w-[430px] flex-col gap-4 py-6">
        <AppHeader />

        <div className="glass-card rise p-5">
          <p className="font-plex text-[11px] text-muted-foreground">
            {profile?.grade ? GRADE_LABELS[profile.grade] : "المرحلة الإعدادية"}
          </p>
          <h2 className="mt-0.5 text-xl font-black">{greeting}</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link
              to="/chat"
              className="flex min-h-[132px] flex-col justify-between rounded-2xl bg-primary p-4 text-right text-primary-foreground ring-1 ring-primary transition-colors hover:bg-primary/90"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-white/25 font-black">
                AI
              </span>
              <span className="text-[15px] leading-snug font-bold">منهجنا AI</span>
            </Link>
            <Link
              to="/quiz"
              className="flex min-h-[132px] flex-col justify-between rounded-2xl bg-white p-4 text-right ring-1 ring-border transition-colors hover:bg-background"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-highlight/25 font-black">
                ٪
              </span>
              <span className="text-[15px] leading-snug font-bold">الامتحانات</span>
            </Link>
          </div>
          <Link
            to="/achievements"
            className="mt-3 flex items-center justify-between rounded-2xl bg-white p-4 text-right ring-1 ring-border transition-colors hover:bg-background"
          >
            <span className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-highlight/25 font-black">
                ✓
              </span>
              <span className="text-[15px] font-bold">إنجازاتي</span>
            </span>
            <span className="font-plex text-[11px] text-muted-foreground">اختباراتي</span>
          </Link>
          <Link
            to="/curriculum"
            className="mt-3 flex items-center justify-between rounded-2xl bg-white p-4 text-right ring-1 ring-border transition-colors hover:bg-background"
          >
            <span className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-primary-soft font-black text-primary">
                📚
              </span>
              <span className="text-[15px] font-bold">المنهج كامل — الفصل الأول والثاني</span>
            </span>
            <span className="font-plex text-[11px] text-muted-foreground">كل المواد</span>
          </Link>
        </div>

        <div className="glass-card rise p-5">
          <h3 className="text-[15px] font-bold">نصيحة اليوم</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            اسأل المساعد يشرح لك الدرس قبل ما تحل الواجب، بتفهم أسرع وبتحل بنفسك.
          </p>
          <Link
            to="/setup"
            className="mt-4 inline-block rounded-full border border-border px-4 py-2 text-[13px] font-bold text-muted-foreground"
          >
            تعديل الاسم والمرحلة
          </Link>
        </div>

        <p className="font-plex pb-1 text-center text-[11px] text-muted-foreground">
          منهجنا · المنهج البحريني للمرحلة الإعدادية
        </p>
        <p className="font-plex pb-2 text-center text-[11px] text-muted-foreground">
          من إنشاء: إبراهيم خليل إبراهيم البنخليل
        </p>
      </div>
    </div>
  );
}
