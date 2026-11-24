import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { GRADE_LABELS } from "@/lib/student-profile";
import { CURRICULUM } from "@/lib/curriculum";
import { generateQuiz } from "@/lib/ai.functions";
import { recordQuizResult } from "@/lib/student-progress";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "الامتحانات — منهجنا" },
      {
        name: "description",
         content: "أسئلة تدريبية حسب الصف والمادة والفصل والوحدة أو الدرس المختار: سهل 10 أسئلة أو صعب 15 سؤال.",
      },
      { property: "og:title", content: "الامتحانات — منهجنا" },
      { property: "og:description", content: "اختر الفصل والوحدة أو الدرس لاختبار تدريبي من 10 أو 15 سؤالاً." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: QuizPage,
});

type Question = {
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
};

function QuizPage() {
  const navigate = useNavigate();
  const { data: profile, authLoading } = useProfile();
  const makeQuiz = useServerFn(generateQuiz);

  const [subject, setSubject] = useState<string>("الرياضيات");
  const [difficulty, setDifficulty] = useState<"easy" | "hard">("easy");
  const [semester, setSemester] = useState<1 | 2>(1);
  const [unitIndex, setUnitIndex] = useState("");
  const [lessonIndex, setLessonIndex] = useState("");
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const activeGrade = profile?.grade ?? 7;
  const subjects = useMemo(
    () => (CURRICULUM[activeGrade] ?? CURRICULUM[7] ?? []).map((item) => item.name),
    [activeGrade],
  );
  const questionCount = difficulty === "easy" ? 10 : 15;
  const units = CURRICULUM[activeGrade]?.find((item) => item.name === subject)?.semesters[semester] ?? [];
  const lessons = unitIndex === "" ? [] : units[Number(unitIndex)]?.lessons ?? [];

  useEffect(() => {
    if (!authLoading && !profile) navigate({ to: "/" });
  }, [authLoading, profile, navigate]);

  useEffect(() => {
    const firstSubject = subjects[0];
    if (firstSubject && !subjects.includes(subject)) setSubject(firstSubject);
  }, [subject, subjects]);

  const start = async () => {
    setBusy(true);
    try {
      const result = await makeQuiz({
        data: { subject, difficulty, grade: activeGrade, questionCount, semester,
          ...(unitIndex === "" ? {} : { unitIndex: Number(unitIndex) }),
          ...(lessonIndex === "" ? {} : { lessonIndex: Number(lessonIndex) }),
        },
      });
      if (!result.questions.length) throw new Error("empty");
      setQuestions(result.questions);
      setIndex(0);
      setPicked(null);
      setScore(0);
      setDone(false);
    } catch {
      toast.error("تعذّر تجهيز الامتحان الآن، جرّب مرة ثانية");
    } finally {
      setBusy(false);
    }
  };

  const next = async () => {
    if (!questions) return;
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setPicked(null);
      return;
    }
    setDone(true);
    recordQuizResult({ answered: questions.length, correct: score });
  };

  const current = questions?.[index];

  return (
    <div className="flex min-h-screen justify-center p-4">
      <div className="flex w-full max-w-[430px] flex-col gap-4 py-6">
        <AppHeader subtitle="الامتحانات" />

        {!questions && (
          <div className="glass-card rise p-5">
            <h3 className="text-[15px] font-bold">جهّز امتحانك</h3>
            <p className="mt-2 text-sm text-muted-foreground">{GRADE_LABELS[profile?.grade ?? 7]}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {subjects.map((item) => (
                <Button
                  variant="outline"
                  key={item}
                  onClick={() => { setSubject(item); setUnitIndex(""); setLessonIndex(""); }}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                    subject === item
                      ? "bg-primary text-primary-foreground ring-1 ring-primary"
                      : "bg-card text-foreground/70 ring-1 ring-border hover:bg-background"
                  }`}
                >
                  {item}
                </Button>
              ))}
            </div>
            <div className="mt-4 space-y-3">
              <label className="block text-sm font-bold">الفصل الدراسي
                <select aria-label="الفصل الدراسي" value={semester} onChange={(event) => { setSemester(event.target.value === "2" ? 2 : 1); setUnitIndex(""); setLessonIndex(""); }} className="mt-1 w-full rounded-lg border border-input bg-card p-3 text-foreground">
                  <option value="1">الفصل الأول</option><option value="2">الفصل الثاني</option>
                </select>
              </label>
              <label className="block text-sm font-bold">الوحدة
                <select aria-label="الوحدة" value={unitIndex} onChange={(event) => { setUnitIndex(event.target.value); setLessonIndex(""); }} className="mt-1 w-full rounded-lg border border-input bg-card p-3 text-foreground">
                  <option value="">جميع وحدات الفصل</option>
                  {units.map((unit, position) => <option key={position} value={position}>{unit.title}</option>)}
                </select>
              </label>
              {unitIndex !== "" && <label className="block text-sm font-bold">الدرس
                <select aria-label="الدرس" value={lessonIndex} onChange={(event) => setLessonIndex(event.target.value)} className="mt-1 w-full rounded-lg border border-input bg-card p-3 text-foreground">
                  <option value="">جميع دروس الوحدة</option>
                  {lessons.map((lesson, position) => <option key={position} value={position}>{lesson.title}</option>)}
                </select>
              </label>}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">أسئلة تدريبية مولّدة من عناوين دليل المذاكرة، وليست أسئلة وزارة رسمية؛ لم تُطابق العناوين مع الكتاب الرسمي.</p>
            <div className="mt-4 flex gap-2">
              {(
                [
                  { value: "easy", label: "سهل · 10 أسئلة" },
                  { value: "hard", label: "صعب · 15 سؤال" },
                ] as const
              ).map((level) => (
                <Button
                  variant="outline"
                  key={level.value}
                  onClick={() => setDifficulty(level.value)}
                  className={`flex-1 rounded-xl py-2 text-sm font-bold transition-colors ${
                    difficulty === level.value
                      ? "bg-primary text-primary-foreground ring-1 ring-primary"
                      : "bg-card text-foreground/70 ring-1 ring-border hover:bg-background"
                  }`}
                >
                  {level.label}
                </Button>
              ))}
            </div>
            <Button
                  variant="outline"
              onClick={start}
              disabled={busy}
              className="mt-4 h-auto w-full rounded-2xl bg-foreground py-3 text-[15px] font-bold text-primary-foreground transition-colors hover:bg-foreground/90 disabled:opacity-60"
            >
              {busy ? "جاري تجهيز الأسئلة…" : `ابدأ الامتحان · ${questionCount} ${questionCount === 10 ? "أسئلة" : "سؤال"}`}
            </Button>
          </div>
        )}

        {questions && !done && current && (
          <div className="glass-card rise p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-bold">امتحان {subject}</h3>
              <span className="font-plex text-[11px] text-muted-foreground">
                {index + 1} من {questions.length}
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${((index + (picked !== null ? 1 : 0)) / questions.length) * 100}%` }}
              />
            </div>

            <p className="mt-4 text-[15px] leading-relaxed font-bold">{current.question}</p>
            <div className="mt-3 flex flex-col gap-2">
              {current.choices.map((choice, choiceIndex) => {
                const isCorrect = choiceIndex === current.correctIndex;
                const chosen = picked === choiceIndex;
                const state =
                  picked === null
                    ? "bg-card ring-1 ring-border hover:bg-background"
                    : isCorrect
                      ? "bg-primary-soft text-primary font-bold ring-1 ring-primary/30"
                      : chosen
                        ? "bg-destructive/10 text-destructive ring-1 ring-destructive/30"
                        : "bg-card ring-1 ring-border opacity-70";
                return (
                  <Button
                  variant="outline"
                    key={choiceIndex}
                    disabled={picked !== null}
                    onClick={() => {
                      setPicked(choiceIndex);
                      if (isCorrect) setScore((value) => value + 1);
                    }}
                    className={`h-auto justify-start whitespace-normal rounded-xl px-4 py-2.5 text-right text-sm transition-colors ${state}`}
                  >
                    {choice}
                  </Button>
                );
              })}
            </div>

            {picked !== null && (
              <p className="mt-3 rounded-xl bg-highlight/20 px-4 py-2.5 text-sm leading-relaxed">
                {current.explanation}
              </p>
            )}

            <Button
                  variant="outline"
              onClick={next}
              disabled={picked === null}
              className="mt-4 h-auto w-full rounded-2xl bg-foreground py-3 text-[15px] font-bold text-primary-foreground transition-colors hover:bg-foreground/90 disabled:opacity-50"
            >
              {index + 1 === questions.length ? "إنهاء" : "التالي"}
            </Button>
          </div>
        )}

        {done && questions && (
          <div className="glass-card rise p-5 text-center">
            <h3 className="text-[17px] font-black">خلصت الامتحان!</h3>
            <p className="mt-2 text-3xl font-black text-primary">
              {score} / {questions.length}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {score === questions.length
                ? "ممتاز! درجة كاملة 🎉"
                : "كمل تدريب، كل محاولة تقوّيك."}
            </p>
            <Button
                  variant="outline"
              onClick={() => setQuestions(null)}
              className="mt-4 h-auto w-full rounded-2xl bg-primary py-3 text-[15px] font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              امتحان جديد
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
