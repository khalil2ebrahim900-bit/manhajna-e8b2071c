import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppHeader } from "@/components/AppHeader";
import { useProfile } from "@/hooks/useProfile";
import { CURRICULUM, EDUNET_URL, GRADE_NAMES, type Subject, type Unit } from "@/lib/curriculum";
import { explainLesson } from "@/lib/ai.functions";
import { GRADE_OPTIONS } from "@/lib/student-profile";

export const Route = createFileRoute("/curriculum")({
  head: () => ({
    meta: [
      { title: "المنهج البحريني — منهجنا" },
      {
        name: "description",
        content:
          "تصفح المنهج البحريني كاملاً لكل المواد من السادس ابتدائي إلى الثالث إعدادي، مع شرح ذكي وروابط المحتوى الرسمي.",
      },
      { property: "og:title", content: "المنهج البحريني — منهجنا" },
      {
        property: "og:description",
        content: "كل المواد من السادس ابتدائي إلى الثالث إعدادي، فصل أول وثاني، مع شرح ذكي لكل درس.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CurriculumPage,
});

type LessonKey = string;

function CurriculumPage() {
  const navigate = useNavigate();
  const { data: profile, authLoading } = useProfile();
  const [grade, setGrade] = useState<number>(7);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [semester, setSemester] = useState<1 | 2>(1);
  const [openUnit, setOpenUnit] = useState<number | null>(0);
  const [explanations, setExplanations] = useState<Record<LessonKey, string>>({});
  const [loadingLesson, setLoadingLesson] = useState<LessonKey | null>(null);

  useEffect(() => {
    if (!authLoading && !profile) navigate({ to: "/" });
  }, [authLoading, profile, navigate]);

  useEffect(() => {
    if (profile?.grade) setGrade(profile.grade);
  }, [profile?.grade]);

  const subjects = CURRICULUM[grade] ?? [];

  const loadExplanation = async (s: Subject, unitIndex: number, lessonIndex: number) => {
    const unit: Unit | undefined = s.semesters[semester][unitIndex];
    const lesson = unit?.lessons[lessonIndex];
    if (!unit || !lesson) return;
    const key = `${grade}-${s.id}-${semester}-${unitIndex}-${lessonIndex}`;
    if (explanations[key] || loadingLesson) return;
    setLoadingLesson(key);
    try {
      const res = await explainLesson({
        data: {
          subject: s.name,
          grade,
          semester,
          unit: unit.title,
          lesson: lesson.title,
        },
      });
      setExplanations((prev) => ({ ...prev, [key]: res.explanation }));
    } catch {
      toast.error("تعذّر تحميل الشرح، حاول مرة ثانية");
    } finally {
      setLoadingLesson(null);
    }
  };

  return (
    <div className="flex min-h-screen justify-center p-4">
      <div className="flex w-full max-w-[430px] flex-col gap-4 py-6">
        <AppHeader subtitle="المنهج البحريني" />

        {/* اختيار الصف */}
        <div className="glass-card rise grid grid-cols-2 gap-2 p-3">
          {GRADE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setGrade(option.value);
                setSubject(null);
                setOpenUnit(0);
              }}
              className={`flex-1 rounded-2xl py-2.5 text-sm font-bold transition-colors ${
                grade === option.value
                  ? "bg-primary text-primary-foreground ring-1 ring-primary"
                  : "bg-white text-foreground/70 ring-1 ring-border hover:bg-background"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {!subject ? (
          /* قائمة المواد */
          <div className="glass-card rise p-5">
            <h2 className="text-[17px] font-bold">مواد {GRADE_NAMES[grade]}</h2>
            <p className="font-plex mt-1 text-[11px] text-muted-foreground">
              الفصل الأول والثاني · كل درس معه شرح ذكي ورابط إديونيت
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {subjects.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSubject(s);
                    setSemester(1);
                    setOpenUnit(0);
                  }}
                  className="flex min-h-[96px] flex-col justify-between rounded-2xl bg-white p-4 text-right ring-1 ring-border transition-colors hover:bg-background"
                >
                  <span className="grid size-9 place-items-center rounded-xl bg-primary-soft text-sm font-black text-primary">
                    {s.icon}
                  </span>
                  <span className="text-[14px] leading-snug font-bold">{s.name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* وحدات ودروس المادة */
          <div className="glass-card rise p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-bold">{subject.name}</h2>
              <button
                onClick={() => setSubject(null)}
                className="rounded-full border border-border px-3 py-1.5 text-[12px] font-bold text-muted-foreground"
              >
                كل المواد
              </button>
            </div>

            {/* الفصل */}
            <div className="mt-3 flex gap-2">
              {([1, 2] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSemester(s);
                    setOpenUnit(0);
                  }}
                  className={`flex-1 rounded-2xl py-2.5 text-sm font-bold transition-colors ${
                    semester === s
                      ? "bg-primary text-primary-foreground ring-1 ring-primary"
                      : "bg-white text-foreground/70 ring-1 ring-border hover:bg-background"
                  }`}
                >
                  {s === 1 ? "الفصل الأول" : "الفصل الثاني"}
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {subject.semesters[semester].map((unit, ui) => (
                <div key={ui} className="rounded-2xl bg-white ring-1 ring-border">
                  <button
                    onClick={() => setOpenUnit(openUnit === ui ? null : ui)}
                    className="flex w-full items-center justify-between p-4 text-right"
                  >
                    <span className="text-[14px] font-bold">{unit.title}</span>
                    <span className="font-plex text-[11px] text-muted-foreground">
                      {openUnit === ui ? "إخفاء" : `${unit.lessons.length} دروس`}
                    </span>
                  </button>
                  {openUnit === ui && (
                    <div className="flex flex-col gap-2 border-t border-border p-3">
                      {unit.lessons.map((lesson, li) => {
                        const key = `${grade}-${subject.id}-${semester}-${ui}-${li}`;
                        const explanation = explanations[key];
                        return (
                          <div key={li} className="rounded-xl bg-background p-3">
                            <p className="text-[13px] font-bold">{lesson.title}</p>
                            <div className="mt-2 flex gap-2">
                              <button
                                onClick={() => loadExplanation(subject, ui, li)}
                                disabled={loadingLesson === key}
                                className="rounded-full bg-primary px-3 py-1.5 text-[12px] font-bold text-primary-foreground disabled:opacity-60"
                              >
                                {loadingLesson === key
                                  ? "جاري الشرح..."
                                  : explanation
                                    ? "الشرح جاهز ↓"
                                    : "اشرح لي الدرس"}
                              </button>
                              <a
                                href={EDUNET_URL}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-full border border-border px-3 py-1.5 text-[12px] font-bold text-muted-foreground"
                              >
                                محتوى الوزارة
                              </a>
                            </div>
                            {explanation && (
                              <p className="mt-3 border-t border-border pt-3 text-[13px] leading-relaxed whitespace-pre-wrap text-foreground/80">
                                {explanation}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="font-plex pb-2 text-center text-[11px] text-muted-foreground">
          منهجنا · المنهج البحريني للمرحلة الإعدادية
        </p>
      </div>
    </div>
  );
}
