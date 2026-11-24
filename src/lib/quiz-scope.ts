import { z } from "zod";
import { CURRICULUM } from "./curriculum";

export const QuizInput = z.object({
  subject: z.string().min(1).max(60),
  grade: z.number().int().min(6).max(9),
  semester: z.union([z.literal(1), z.literal(2)]),
  unitIndex: z.number().int().min(0).optional(),
  lessonIndex: z.number().int().min(0).optional(),
  difficulty: z.enum(["easy", "hard"]),
  questionCount: z.union([z.literal(10), z.literal(15)]),
}).superRefine((data, ctx) => {
  if (data.questionCount !== (data.difficulty === "easy" ? 10 : 15)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid question count" });
  }
  if (data.lessonIndex !== undefined && data.unitIndex === undefined) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Lesson requires a unit" });
  }
});

export function resolveQuizScope(input: z.infer<typeof QuizInput>) {
  const data = QuizInput.parse(input);
  const subject = CURRICULUM[data.grade]?.find((item) => item.name === data.subject);
  if (!subject) throw new Error("Unknown subject for grade");
  const units = subject.semesters[data.semester];
  const chosenUnit = data.unitIndex === undefined ? undefined : units[data.unitIndex];
  if (data.unitIndex !== undefined && !chosenUnit) throw new Error("Unknown unit");
  const chosenLesson = data.lessonIndex === undefined ? undefined : chosenUnit?.lessons[data.lessonIndex];
  if (data.lessonIndex !== undefined && !chosenLesson) throw new Error("Unknown lesson");
  const selectedUnits = chosenUnit ? [chosenUnit] : units;
  return selectedUnits.map((unit) => ({
    unit: unit.title,
    lessons: chosenLesson ? [chosenLesson.title] : unit.lessons.map((lesson) => lesson.title),
  }));
}

export function buildQuizPrompt(input: z.infer<typeof QuizInput>) {
  const scope = resolveQuizScope(input);
  const level = input.difficulty === "easy" ? "سهل ومباشر" : "صعب ويحتاج تفكير وتحليل";
  return `أنشئ ${input.questionCount} سؤال اختيار من متعدد في مادة ${input.subject} للصف ${input.grade}، الفصل الدراسي ${input.semester}، بمستوى ${level}.
الموضوعات المطلوبة حصراً من دليل المذاكرة داخل منهجنا:
${JSON.stringify(scope)}
لا تسأل عن أي درس خارج هذه القائمة، ولا تنتقل إلى صف أو فصل آخر. عند اختيار درس واحد اجعل جميع الأسئلة عنه مع تنويع الأمثلة. وزع الأسئلة على الدروس المختارة عند تعددها.
هذه أسئلة تدريبية مولدة وليست أسئلة وزارة رسمية؛ لا تدّعِ أنك اطلعت على كتاب الوزارة أو أن العناوين موثقة رسمياً.
لكل سؤال أربعة اختيارات مختلفة بالضبط، وإجابة صحيحة واحدة ورقمها من 0 إلى 3، وشرح قصير. تحقق من صحة الحل والاختيارات. اكتب نصاً واضحاً دون LaTeX.`;
}