import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type Profile = {
  id: string;
  full_name: string | null;
  gender: "male" | "female" | null;
  grade: number | null;
};

export function useProfile() {
  const { user, loading } = useAuth();

  const query = useQuery({
    queryKey: ["profile", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, gender, grade")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return (data as Profile) ?? null;
    },
  });

  return { ...query, authLoading: loading, user };
}

export const GRADE_LABELS: Record<number, string> = {
  7: "الصف السابع",
  8: "الصف الثامن",
  9: "الصف التاسع",
};
