import { CURRICULUM } from "@/lib/curriculum";

export type LibraryLesson = { id: string; grade: number; subjectId: string; subject: string; semester: 1 | 2; unit: string; title: string; unitIndex: number; lessonIndex: number };
export function listLessons(grade: number): LibraryLesson[] {
  return (CURRICULUM[grade] ?? []).flatMap((subject) => ([1, 2] as const).flatMap((semester) => subject.semesters[semester].flatMap((unit, unitIndex) => unit.lessons.map((lesson, lessonIndex) => ({ id: `${grade}-${subject.id}-${semester}-${unitIndex}-${lessonIndex}`, grade, subjectId: subject.id, subject: subject.name, semester, unit: unit.title, title: lesson.title, unitIndex, lessonIndex })))));
}
export function normalizeSearch(value: string) {
  return value.normalize("NFKD").replace(/[\u064B-\u065F\u0670\u0640]/g, "").replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").toLowerCase().trim();
}
export function filterLessons(lessons: LibraryLesson[], query: string, subjectId: string, semester: 1 | 2, favoritesOnly: boolean, favorites: string[]) {
  const words = normalizeSearch(query).split(/\s+/).filter(Boolean);
  return lessons.filter((lesson) => lesson.semester === semester && (!subjectId || lesson.subjectId === subjectId) && (!favoritesOnly || favorites.includes(lesson.id)) && words.every((word) => normalizeSearch(`${lesson.title} ${lesson.unit} ${lesson.subject}`).includes(word)));
}
export type LessonActivity = { favorites: string[]; completed: string[] };
export function readLessonActivity(studentId: string): LessonActivity {
  try {
    const raw = JSON.parse(localStorage.getItem(`manhajna.lessons.${studentId}`) ?? "{}");
    return { favorites: Array.isArray(raw.favorites) ? raw.favorites.filter((v: unknown) => typeof v === "string") : [], completed: Array.isArray(raw.completed) ? raw.completed.filter((v: unknown) => typeof v === "string") : [] };
  } catch { return { favorites: [], completed: [] }; }
}
export function toggleLessonActivity(studentId: string, activity: LessonActivity, field: keyof LessonActivity, id: string): LessonActivity {
  const next = { ...activity, [field]: activity[field].includes(id) ? activity[field].filter((value) => value !== id) : [...activity[field], id] };
  localStorage.setItem(`manhajna.lessons.${studentId}`, JSON.stringify(next));
  return next;
}