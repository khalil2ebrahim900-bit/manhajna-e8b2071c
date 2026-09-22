import { Link, useNavigate } from "@tanstack/react-router";

import { GRADE_LABELS, useProfile } from "@/hooks/useProfile";

export function AppHeader({ subtitle }: { subtitle?: string }) {
  const { data: profile, clearProfile } = useProfile();
  const navigate = useNavigate();

  const signOut = async () => {
    clearProfile();
    navigate({ to: "/" });
  };

  return (
    <header className="glass-card flex items-center justify-between px-5 py-4">
      <Link to="/dashboard" className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-2xl bg-primary-soft text-lg font-black text-primary">
          م
        </span>
        <span>
          <span className="block text-lg leading-none font-black">منهجنا</span>
          <span className="font-plex mt-1 block text-[11px] text-muted-foreground">
            {subtitle ?? (profile?.grade ? GRADE_LABELS[profile.grade] : "المنهج البحريني")}
          </span>
        </span>
      </Link>
      <button
        onClick={signOut}
        className="rounded-full border border-border px-4 py-2 text-[13px] font-bold text-muted-foreground transition-colors hover:bg-background"
      >
        خروج
      </button>
    </header>
  );
}
