export type StudentProgress = {
  tests: number;
  answered: number;
  correct: number;
};

const PROGRESS_STORAGE_KEY = "manhajna.studentProgress";

export const EMPTY_PROGRESS: StudentProgress = {
  tests: 0,
  answered: 0,
  correct: 0,
};

export function getStudentProgress(): StudentProgress {
  if (typeof window === "undefined") return EMPTY_PROGRESS;
  const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
  if (!raw) return EMPTY_PROGRESS;
  try {
    const parsed = JSON.parse(raw) as Partial<StudentProgress>;
    return {
      tests: typeof parsed.tests === "number" ? parsed.tests : 0,
      answered: typeof parsed.answered === "number" ? parsed.answered : 0,
      correct: typeof parsed.correct === "number" ? parsed.correct : 0,
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}

export function recordQuizResult(input: { answered: number; correct: number }) {
  if (typeof window === "undefined") return EMPTY_PROGRESS;
  const current = getStudentProgress();
  const next: StudentProgress = {
    tests: current.tests + 1,
    answered: current.answered + input.answered,
    correct: current.correct + input.correct,
  };
  window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function resetStudentProgress() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(PROGRESS_STORAGE_KEY);
  }
}