import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { AppHeader } from "@/components/AppHeader";
import { useProfile } from "@/hooks/useProfile";
import { askAssistant } from "@/lib/ai.functions";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "مساعد الواجبات — منهجنا" },
      {
        name: "description",
        content: "اسأل مساعد منهجنا الذكي عن أي واجب أو درس واحصل على شرح خطوة بخطوة.",
      },
      { property: "og:title", content: "مساعد الواجبات — منهجنا" },
      { property: "og:description", content: "شرح الدروس وحل الواجبات خطوة بخطوة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChatPage,
});

type Message = { role: "user" | "assistant"; content: string };

function ChatPage() {
  const navigate = useNavigate();
  const { data: profile, authLoading } = useProfile();
  const ask = useServerFn(askAssistant);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !profile) navigate({ to: "/" });
  }, [authLoading, profile, navigate]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    const question = input.trim();
    if (!question || busy) return;
    const history = messages.slice(-10);
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setBusy(true);
    try {
      const result = await ask({
        data: { question, grade: profile?.grade ?? 7, history },
      });
      setMessages((prev) => [...prev, { role: "assistant", content: result.answer }]);
    } catch {
      toast.error("تعذّر الوصول للمساعد الآن، جرّب بعد شوي");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen justify-center p-4">
      <div className="flex w-full max-w-[430px] flex-col gap-4 py-6">
        <AppHeader subtitle="مساعد الواجبات" />

        <div className="glass-card rise overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border/70 px-5 py-3">
            <span className="size-2 rounded-full bg-primary" />
            <h3 className="text-[15px] font-bold">مساعد منهجنا</h3>
          </div>

          <div className="flex max-h-[55vh] min-h-[280px] flex-col gap-3 overflow-y-auto p-5">
            {messages.length === 0 && (
              <p className="text-sm leading-relaxed text-muted-foreground">
                اكتب سؤالك أو انسخ الواجب هنا، وبشرح لك الحل خطوة بخطوة.
              </p>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={
                  message.role === "user"
                    ? "max-w-[85%] self-end rounded-2xl rounded-tr-md bg-primary px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-primary-foreground"
                    : "max-w-[88%] self-start rounded-2xl rounded-tl-md bg-white px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ring-1 ring-black/5"
                }
              >
                {message.content}
              </div>
            ))}
            {busy && (
              <div className="max-w-[88%] self-start rounded-2xl rounded-tl-md bg-white px-4 py-2.5 text-sm text-muted-foreground ring-1 ring-black/5">
                يفكر في الحل…
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={send} className="p-3 pt-0">
            <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 ring-1 ring-black/5">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="اكتب سؤالك…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                disabled={busy}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                إرسال
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
