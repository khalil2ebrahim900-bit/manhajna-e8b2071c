import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";

export const Route = createFileRoute("/setup")({
  head: () => ({
    meta: [
      { title: "اختر جنسك وصفك — منهجنا" },
      {
        name: "description",
        content: "حدد جنسك وصفك الدراسي (سابع، ثامن، تاسع) ليجهّز منهجنا محتوى مناسب لك.",
      },
      { property: "og:title", content: "اختر جنسك وصفك — منهجنا" },
      { property: "og:description", content: "خطوة سريعة لتخصيص المساعدة حسب صفك." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SetupPage,
});

function SetupPage() {
  const navigate = useNavigate();
  const { data: profile, user, authLoading, refetch } = useProfile();
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [grade, setGrade] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/" });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (profile) {
      setGender(profile.gender);
      setGrade(profile.grade);
      setName(profile.full_name ?? "");
    }
  }, [profile]);

  const save = async () => {
    if (!user || !gender || !grade) {
      toast.error("اختر الجنس والصف أول");
      return;
    }
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, gender, grade, full_name: name || null });
    setBusy(false);
    if (error) {
      toast.error("تعذّر الحفظ، حاول مرة ثانية");
      return;
    }
    await refetch();
    navigate({ to: "/dashboard" });
  };

  const grades = [
    { value: 7, label: "سابع" },
    { value: 8, label: "ثامن" },
    { value: 9, label: "تاسع" },
  ];

  return (
    <div className="flex min-h-screen justify-center p-4">
      <div className="flex w-full max-w-[430px] flex-col gap-4 py-6">
        <div className="glass-card rise p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] font-bold">اختر صفّك</h2>
            <span className="font-plex text-[11px] text-muted-foreground">الخطوة 2 من 2</span>
          </div>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اسمك"
            className="mt-4 w-full rounded-2xl bg-white px-4 py-3 text-sm ring-1 ring-border outline-none placeholder:text-muted-foreground focus:ring-primary/40"
          />

          <div className="mt-3 flex gap-2">
            {grades.map((g) => (
              <button
                key={g.value}
                onClick={() => setGrade(g.value)}
                className={`flex-1 rounded-2xl py-3 text-sm font-bold transition-colors ${
                  grade === g.value
                    ? "bg-primary text-primary-foreground ring-1 ring-primary"
                    : "bg-white text-foreground/70 ring-1 ring-border hover:bg-background"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {(
              [
                { value: "male", label: "طالب" },
                { value: "female", label: "طالبة" },
              ] as const
            ).map((g) => (
              <button
                key={g.value}
                onClick={() => setGender(g.value)}
                className={`rounded-2xl py-3 text-sm font-bold transition-colors ${
                  gender === g.value
                    ? "bg-primary-soft text-primary ring-1 ring-primary/20"
                    : "bg-white text-foreground/70 ring-1 ring-border hover:bg-background"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          <button
            onClick={save}
            disabled={busy}
            className="mt-4 w-full rounded-2xl bg-foreground py-3 text-[15px] font-bold text-white transition-colors hover:bg-foreground/90 disabled:opacity-60"
          >
            {busy ? "جاري الحفظ..." : "ابدأ التعلّم"}
          </button>
        </div>
      </div>
    </div>
  );
}
