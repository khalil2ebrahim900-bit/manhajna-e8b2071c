import { describe, it as test } from "node:test";
import { strict as assert } from "node:assert";
import { filterLessons, listLessons, normalizeSearch } from "./lesson-library";

describe("lesson library rules", () => {
  test("sixth to third intermediate each expose both semesters", () => {
    for (const grade of [6, 7, 8, 9]) {
      const lessons = listLessons(grade);
      assert.deepEqual(new Set(lessons.map((lesson) => lesson.semester)), new Set([1, 2]));
      assert.equal(new Set(lessons.map((lesson) => lesson.subjectId)).size, 7);
    }
  });
  test("Arabic search ignores diacritics and alef variations", () => {
    assert.equal(normalizeSearch("أَعْداد"), "اعداد");
    assert.deepEqual(filterLessons(listLessons(6), "القواسم", "math", 1, false, []).map((lesson) => lesson.title), ["القواسم والمضاعفات"]);
  });
  test("favorites filter returns only saved lessons in the selected semester", () => {
    const lessons = listLessons(6);
    const first = lessons[0];
    if (!first) throw new Error("Missing sixth-grade lesson");
    assert.deepEqual(filterLessons(lessons, "", "", 1, true, [first.id]).map((lesson) => lesson.id), [first.id]);
    assert.deepEqual(filterLessons(lessons, "", "", 2, true, [first.id]), []);
  });
});