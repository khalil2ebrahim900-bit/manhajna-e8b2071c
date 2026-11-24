import { describe, it as test } from "node:test";
import { strict as assert } from "node:assert";
import { QuizInput, resolveQuizScope } from "./quiz-scope";

const base = { grade: 6, subject: "الرياضيات", semester: 1 as const, difficulty: "easy" as const, questionCount: 10 as const };

describe("quiz curriculum scope", () => {
  test("selected semester excludes the other semester", () => {
    assert.deepEqual(resolveQuizScope(base).map((item) => item.unit), ["الأعداد والعمليات", "النسبة والقياس"]);
    assert.deepEqual(resolveQuizScope({ ...base, semester: 2 }).map((item) => item.unit), ["الجبر البسيط", "الهندسة والبيانات"]);
  });
  test("a selected lesson excludes all sibling lessons", () => {
    assert.deepEqual(resolveQuizScope({ ...base, unitIndex: 0, lessonIndex: 1 }), [{ unit: "الأعداد والعمليات", lessons: ["القواسم والمضاعفات"] }]);
  });
  test("unknown lessons cannot fall back to general questions", () => {
    assert.throws(() => resolveQuizScope({ ...base, unitIndex: 0, lessonIndex: 99 }), /Unknown lesson/);
    assert.equal(QuizInput.safeParse({ ...base, lessonIndex: 1 }).success, false);
  });
  test("easy is exactly 10 questions", () => {
    assert.equal(QuizInput.safeParse(base).success, true);
    assert.equal(QuizInput.safeParse({ ...base, questionCount: 15 }).success, false);
  });
  test("hard is exactly 15 questions", () => {
    assert.equal(QuizInput.safeParse({ ...base, difficulty: "hard", questionCount: 15 }).success, true);
    assert.equal(QuizInput.safeParse({ ...base, difficulty: "hard" }).success, false);
  });
});