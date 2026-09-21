import { createOpenAI } from "@ai-sdk/openai";
import { createServerFn } from "@tanstack/react-start";
import { Output, streamText } from "ai";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayRunIdFetch } from "./ai-gateway.server";

const MODEL = "openai/gpt-6-astra";

function gateway() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  const runIdFetch = createLovableAiGatewayRunIdFetch();
  return createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey: key,
    headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
}

const reasoning = {
  openai: {
    forceReasoning: true,
    reasoningEffort: "low",
    store: false,
  },
} as const;

const AskInput = z.object({
  question: z.string().min(1).max(4000),
  grade: z.number().int().min(7).max(9),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .max(20)
    .default([]),
});

export const askAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AskInput.parse(input))
  .handler(async ({ data }) => {
    const lovable = gateway();
    const result = streamText({
      model: lovable.responses(MODEL),
      system: `أنت "مساعد منهجنا"، معلم ودود لطلاب المرحلة الإعدادية في مملكة البحرين (الصف ${data.grade}).
- اشرح بالعربية الفصحى المبسطة مع لمسة خليجية ودودة.
- اشرح الحل خطوة بخطوة ولا تعطِ الجواب النهائي فقط.
- إذا كان السؤال واجباً، ساعد الطالب على الفهم وشجّعه.
- اربط الشرح بالمنهج البحريني قدر الإمكان.
- اجعل الرد قصيراً ومنظماً (أقل من 250 كلمة) ما لم يطلب الطالب تفصيلاً.`,
      messages: [
        ...data.history.map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: data.question },
      ],
      providerOptions: reasoning,
    });

    return { answer: await result.text };
  });

const LessonInput = z.object({
  subject: z.string().min(1).max(60),
  grade: z.number().int().min(7).max(9),
  semester: z.number().int().min(1).max(2),
  unit: z.string().min(1).max(120),
  lesson: z.string().min(1).max(160),
});

export const explainLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => LessonInput.parse(input))
  .handler(async ({ data }) => {
    const lovable = gateway();
    const result = streamText({
      model: lovable.responses(MODEL),
      system: `أنت "مساعد منهجنا"، معلم ودود لطلاب المرحلة الإعدادية في مملكة البحرين (الصف ${data.grade}).
- اشرح بالعربية الفصحى المبسطة مع لمسة خليجية ودودة.
- التزم بالمنهج البحريني لمادة ${data.subject}.
- نظّم الشرح: فكرة الدرس، المفاهيم الأساسية، مثال تطبيقي، ونصيحة للمذاكرة.
- اجعل الشرح واضحاً ومختصراً (أقل من 300 كلمة).`,
      prompt: `اشرح درس "${data.lesson}" من وحدة "${data.unit}" في مادة ${data.subject} للصف ${data.grade} (الفصل الدراسي ${data.semester}).`,
      providerOptions: reasoning,
    });

    return { explanation: await result.text };
  });

const QuizInput = z.object({
  subject: z.string().min(1).max(60),
  grade: z.number().int().min(7).max(9),
  difficulty: z.enum(["easy", "hard"]),
});

const QuizSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      choices: z.array(z.string()),
      correctIndex: z.number(),
      explanation: z.string(),
    }),
  ),
});

export type Quiz = z.infer<typeof QuizSchema>;

export const generateQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => QuizInput.parse(input))
  .handler(async ({ data }) => {
    const lovable = gateway();
    const level = data.difficulty === "easy" ? "سهل ومباشر" : "صعب ويحتاج تفكير وتحليل";
    const result = streamText({
      model: lovable.responses(MODEL),
      system:
        "أنت معلم بحريني تصمم اختبارات قصيرة للمرحلة الإعدادية حسب المنهج البحريني. اكتب كل النصوص بالعربية.",
      prompt: `أنشئ 5 أسئلة اختيار من متعدد في مادة ${data.subject} لطالب الصف ${data.grade}، بمستوى ${level}.
لكل سؤال أربعة اختيارات بالضبط، وحدد رقم الاختيار الصحيح (0 إلى 3)، واكتب شرحاً قصيراً للإجابة الصحيحة.`,
      output: Output.object({ schema: QuizSchema }),
      providerOptions: reasoning,
    });

    const quiz = await result.output;
    return {
      questions: quiz.questions
        .filter((q) => q.choices.length === 4)
        .slice(0, 5)
        .map((q) => ({
          ...q,
          correctIndex: Math.min(Math.max(q.correctIndex, 0), 3),
        })),
    };
  });
