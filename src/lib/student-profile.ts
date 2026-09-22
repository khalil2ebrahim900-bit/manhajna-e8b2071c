export type GradeValue = 6 | 7 | 8 | 9;

export type StudentProfile = {
  id: string;
  full_name: string;
  grade: GradeValue;
};

const PROFILE_STORAGE_KEY = "manhajna.studentProfile";

export const GRADE_OPTIONS: Array<{ value: GradeValue; label: string }> = [
  { value: 6, label: "السادس ابتدائي" },
  { value: 7, label: "الأول إعدادي" },
  { value: 8, label: "الثاني إعدادي" },
  { value: 9, label: "الثالث إعدادي" },
];

export const GRADE_LABELS: Record<GradeValue, string> = {
  6: "السادس ابتدائي",
  7: "الأول إعدادي",
  8: "الثاني إعدادي",
  9: "الثالث إعدادي",
};

export function isGradeValue(value: number): value is GradeValue {
  return value === 6 || value === 7 || value === 8 || value === 9;
}

export function getStoredProfile(): StudentProfile | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StudentProfile>;
    if (!parsed.full_name || typeof parsed.grade !== "number" || !isGradeValue(parsed.grade)) {
      return null;
    }
    return {
      id: parsed.id || `student-${Date.now()}`,
      full_name: parsed.full_name,
      grade: parsed.grade,
    };
  } catch {
    return null;
  }
}

export function saveStoredProfile(input: { full_name: string; grade: GradeValue }): StudentProfile {
  const previous = getStoredProfile();
  const profile: StudentProfile = {
    id: previous?.id ?? `student-${Date.now()}`,
    full_name: input.full_name.trim(),
    grade: input.grade,
  };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  }
  return profile;
}

export function clearStoredProfile() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(PROFILE_STORAGE_KEY);
  }
}