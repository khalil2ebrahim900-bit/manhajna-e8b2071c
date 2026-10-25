import { describe, expect, test } from "bun:test";
import { filterLessons, listLessons, normalizeSearch } from "./lesson-library";

describe("lesson library rules", () => {
  test("sixth to third intermediate each expose both semesters", () => {
    for (const grade of [6, 7, 8, 9]) {
      const lessons = listLessons(grade);
      expect(new Set(lessons.map((lesson) => lesson.semester))).toEqual(new Set([1, 2]));
      expect(new Set(lessons.map((lesson) => lesson.subjectId)).size).toBe(7);
    }
  });
  test("Arabic search ignores diacritics and alef variations", () => {
    expect(normalizeSearch("أَعْداد")).toBe("اعداد");
    expect(filterLessons(listLessons(6), "القواسم", "math", 1, false, []).map((lesson) => lesson.title)).toEqual(["القواسم والمضاعفات"]);
  });
  test("favorites filter returns only saved lessons in the selected semester", () => {
    const lessons = listLessons(6);
    const first = lessons[0];
    if (!first) throw new Error("Missing sixth-grade lesson");
    expect(filterLessons(lessons, "", "", 1, true, [first.id]).map((lesson) => lesson.id)).toEqual([first.id]);
    expect(filterLessons(lessons, "", "", 2, true, [first.id])).toEqual([]);
  });
});