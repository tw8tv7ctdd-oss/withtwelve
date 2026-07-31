import type { Message } from "@/integrations/supabase/db-types";

/** A single turn. Assistant, user and neutral system voices read differently. */
export function MessageBubble({
  role,
  content,
  discipleName,
  isCrisis = false,
  isStreaming = false,
  isOrphaned = false,
}: {
  role: Message["role"];
  content: string;
  discipleName?: string | null;
  isCrisis?: boolean;
  isStreaming?: boolean;
  isOrphaned?: boolean;
}) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-2xl bg-primary/10 px-4 py-3 text-sm leading-relaxed text-foreground">
          {content}
        </p>
      </div>
    );
  }

  if (role === "system" || isCrisis) {
    return (
      <div className="rounded-2xl border border-border bg-surface px-4 py-4 shadow-sm">
        <p className="mb-1.5 text-xs tracking-wide text-muted-foreground uppercase">
          A quiet word
        </p>
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">{content}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-surface px-4 py-4 shadow-sm">
      {discipleName ? (
        <p className="mb-1.5 text-xs font-medium tracking-wide text-accent">{discipleName}</p>
      ) : null}
      {isOrphaned ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          This reflection didn't finish. You can ask again when you're ready.
        </p>
      ) : (
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
          {content}
          {isStreaming ? <span className="ml-0.5 animate-pulse text-primary">|</span> : null}
        </p>
      )}
    </div>
  );
}