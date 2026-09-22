import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AppHeader } from "@/components/AppHeader";
import { useProfile } from "@/hooks/useProfile";
import { EMPTY_PROGRESS, getStudentProgress, type StudentProgress } from "@/lib/student-progress";

export const Route = createFileRoute("/achievements")({
  head: () => ({
    meta: [
      { title: "إنجازاتي — منهجنا" },
      {
        name: "description",
        content: "تابع عدد اختباراتك، الأسئلة المجابة، والإجابات الصحيحة في منهجنا.",
      },
      { property: "og:title", content: "إنجازاتي — منهجنا" },
      { property: "og:description", content: "متابعة بسيطة لإنجازات الطالب داخل منهجنا." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AchievementsPage,
});

function AchievementsPage() {
  const navigate = useNavigate();
  const { data: profile, authLoading } = useProfile();
  const [progress, setProgress] = useState<StudentProgress>(EMPTY_PROGRESS);

  useEffect(() => {
    if (!authLoading && !profile) navigate({ to: "/" });
  }, [authLoading, profile, navigate]);

  useEffect(() => {
    setProgress(getStudentProgress());
  }, []);

  const items = [
    { label: "عدد الاختبارات", value: progress.tests },
    { label: "عدد الأسئلة المجابة", value: progress.answered },
    { label: "عدد الإجابات الصحيحة", value: progress.correct },
  ];

  return (
    <div className="flex min-h-screen justify-center p-4">
      <div className="flex w-full max-w-[430px] flex-col gap-4 py-6">
        <AppHeader subtitle="إنجازاتي" />

        <div className="glass-card rise p-5">
          <h2 className="text-[18px] font-black">إنجازاتي</h2>
          <p className="font-plex mt-1 text-[11px] text-muted-foreground">
            {profile?.full_name ?? "طالب منهجنا"}
          </p>

          <div className="mt-4 flex flex-col gap-3">
            {items.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-2xl bg-white px-4 py-4 ring-1 ring-border"
              >
                <span className="text-sm font-bold text-muted-foreground">{item.label}</span>
                <span className="text-2xl font-black text-primary">{item.value}</span>
              </div>
            ))}
          </div>

          <Link
            to="/quiz"
            className="mt-4 block rounded-2xl bg-primary py-3 text-center text-[15px] font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            ابدأ اختبار جديد
          </Link>
        </div>
      </div>
    </div>
  );
}