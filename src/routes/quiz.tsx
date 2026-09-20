import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppHeader } from "@/components/AppHeader";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { generateQuiz } from "@/lib/ai.functions";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "الامتحانات — منهجنا" },
      {
        name: "description",
        content: "امتحانات قصيرة بالاختيارات على المنهج البحريني، اختر مستوى سهل أو صعب.",
      },
      { property: "og:title", content: "الامتحانات — منهجنا" },
      { property: "og:description", content: "اختبر نفسك بمستوى سهل أو صعب واعرف درجتك فوراً." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: QuizPage,
});

const SUBJECTS = ["الرياضيات", "العلوم", "اللغة العربية", "اللغة الإنجليزية", "الاجتماعيات"];

type Question = {
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
};

function QuizPage() {
  const navigate = useNavigate();
  const { data: profile, user, authLoading } = useProfile();
  const makeQuiz = useServerFn(generateQuiz);

  const [subject, setSubject] = useState<string>("الرياضيات");
  const [difficulty, setDifficulty] = useState<"easy" | "hard">("easy");
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/" });
  }, [authLoading, user, navigate]);

  const start = async () => {
    setBusy(true);
    try {
      const result = await makeQuiz({
        data: { subject, difficulty, grade: profile?.grade ?? 9 },
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
    if (user) {
      await supabase.from("quiz_results").insert({
        user_id: user.id,
        subject,
        difficulty,
        score,
        total: questions.length,
      });
    }
  };

  const current = questions?.[index];

  return (
    <div className="flex min-h-screen justify-center p-4">
      <div className="flex w-full max-w-[430px] flex-col gap-4 py-6">
        <AppHeader subtitle="الامتحانات" />

        {!questions && (
          <div className="glass-card rise p-5">
            <h3 className="text-[15px] font-bold">جهّز امتحانك</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {SUBJECTS.map((item) => (
                <button
                  key={item}
                  onClick={() => setSubject(item)}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                    subject === item
                      ? "bg-primary text-primary-foreground ring-1 ring-primary"
                      : "bg-white text-foreground/70 ring-1 ring-border hover:bg-background"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              {(
                [
                  { value: "easy", label: "سهل" },
                  { value: "hard", label: "صعب" },
                ] as const
              ).map((level) => (
                <button
                  key={level.value}
                  onClick={() => setDifficulty(level.value)}
                  className={`flex-1 rounded-xl py-2 text-sm font-bold transition-colors ${
                    difficulty === level.value
                      ? "bg-primary text-primary-foreground ring-1 ring-primary"
                      : "bg-white text-foreground/70 ring-1 ring-border hover:bg-background"
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
            <button
              onClick={start}
              disabled={busy}
              className="mt-4 w-full rounded-2xl bg-foreground py-3 text-[15px] font-bold text-white transition-colors hover:bg-foreground/90 disabled:opacity-60"
            >
              {busy ? "جاري تجهيز الأسئلة…" : "ابدأ الامتحان"}
            </button>
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
                    ? "bg-white ring-1 ring-border hover:bg-background"
                    : isCorrect
                      ? "bg-primary-soft text-primary font-bold ring-1 ring-primary/30"
                      : chosen
                        ? "bg-destructive/10 text-destructive ring-1 ring-destructive/30"
                        : "bg-white ring-1 ring-border opacity-70";
                return (
                  <button
                    key={choiceIndex}
                    disabled={picked !== null}
                    onClick={() => {
                      setPicked(choiceIndex);
                      if (isCorrect) setScore((value) => value + 1);
                    }}
                    className={`rounded-xl px-4 py-2.5 text-right text-sm transition-colors ${state}`}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>

            {picked !== null && (
              <p className="mt-3 rounded-xl bg-highlight/20 px-4 py-2.5 text-sm leading-relaxed">
                {current.explanation}
              </p>
            )}

            <button
              onClick={next}
              disabled={picked === null}
              className="mt-4 w-full rounded-2xl bg-foreground py-3 text-[15px] font-bold text-white transition-colors hover:bg-foreground/90 disabled:opacity-50"
            >
              {index + 1 === questions.length ? "إنهاء" : "التالي"}
            </button>
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
            <button
              onClick={() => setQuestions(null)}
              className="mt-4 w-full rounded-2xl bg-primary py-3 text-[15px] font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              امتحان جديد
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
