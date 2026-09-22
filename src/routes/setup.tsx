import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useProfile } from "@/hooks/useProfile";
import { GRADE_OPTIONS, isGradeValue, type GradeValue } from "@/lib/student-profile";

export const Route = createFileRoute("/setup")({
  head: () => ({
    meta: [
      { title: "اختر اسمك ومرحلتك — منهجنا" },
      {
        name: "description",
        content: "حدد اسمك الثلاثي ومرحلتك من السادس ابتدائي إلى الثالث إعدادي.",
      },
      { property: "og:title", content: "اختر اسمك ومرحلتك — منهجنا" },
      { property: "og:description", content: "خطوة سريعة لتخصيص المساعدة حسب المرحلة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SetupPage,
});

function SetupPage() {
  const navigate = useNavigate();
  const { data: profile, saveProfile } = useProfile();
  const [grade, setGrade] = useState<GradeValue | "">("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (profile) {
      setGrade(profile.grade);
      setName(profile.full_name);
    }
  }, [profile]);

  const save = () => {
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
        <div className="glass-card rise p-5">
          <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-bold">بيانات الطالب</h2>
              <span className="font-plex text-[11px] text-muted-foreground">الاسم والمرحلة</span>
          </div>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
              placeholder="الاسم الثلاثي"
            className="mt-4 w-full rounded-2xl bg-white px-4 py-3 text-sm ring-1 ring-border outline-none placeholder:text-muted-foreground focus:ring-primary/40"
          />

          <select
            value={grade}
            onChange={(e) => {
              const nextGrade = Number(e.target.value);
              setGrade(isGradeValue(nextGrade) ? nextGrade : "");
            }}
            className="mt-3 w-full rounded-2xl bg-white px-4 py-3 text-sm ring-1 ring-border outline-none focus:ring-primary/40"
          >
            <option value="">اختر المرحلة</option>
            {GRADE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            onClick={save}
            className="mt-4 w-full rounded-2xl bg-foreground py-3 text-[15px] font-bold text-white transition-colors hover:bg-foreground/90 disabled:opacity-60"
          >
            حفظ البيانات
          </button>
        </div>
      </div>
    </div>
  );
}
