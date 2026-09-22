import { useCallback, useEffect, useState } from "react";

import {
  clearStoredProfile,
  getStoredProfile,
  GRADE_LABELS,
  saveStoredProfile,
  type GradeValue,
  type StudentProfile,
} from "@/lib/student-profile";

export type Profile = StudentProfile;

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setProfile(getStoredProfile());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveProfile = useCallback((input: { full_name: string; grade: GradeValue }) => {
    const next = saveStoredProfile(input);
    setProfile(next);
    return next;
  }, []);

  const clearProfile = useCallback(() => {
    clearStoredProfile();
    setProfile(null);
  }, []);

  const refetch = useCallback(async () => {
    const next = getStoredProfile();
    setProfile(next);
    setLoading(false);
    return { data: next };
  }, []);

  return {
    data: profile,
    authLoading: loading,
    isLoading: loading,
    user: profile ? { id: profile.id } : null,
    refetch,
    saveProfile,
    clearProfile,
  };
}

export { GRADE_LABELS };
