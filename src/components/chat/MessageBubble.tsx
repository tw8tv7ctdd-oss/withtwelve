import type { Message } from "@/integrations/supabase/db-types";

/** Three soft dots while a reply is being formed. */
function Thinking() {
  return (
    <span className="flex items-center gap-1 py-1" aria-label="Forming a reply">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary/50"
          style={{ animationDelay: `${i * 200}ms` }}
        />
      ))}
    </span>
  );
}

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
        <p className="max-w-[85%] rounded-2xl bg-primary/10 px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
          {content}
        </p>
      </div>
    );
  }

  if (role === "system" || isCrisis) {
    return (
      <div className="rounded-2xl border border-border bg-surface px-4 py-3.5">
        <p className="mb-1.5 text-[11px] tracking-[0.08em] text-muted-foreground uppercase">A quiet word</p>
        {content ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">{content}</p>
        ) : (
          <Thinking />
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-surface px-4 py-3.5 shadow-sm">
      {discipleName ? (
        <p className="mb-1.5 text-[11px] font-medium tracking-[0.06em] text-accent uppercase">{discipleName}</p>
      ) : null}
      {isOrphaned ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          This reflection was left unfinished. You can ask again whenever you're ready.
        </p>
      ) : !content && isStreaming ? (
        <Thinking />
      ) : (
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
          {content}
          {isStreaming ? (
            <span className="ml-0.5 animate-pulse text-primary" aria-hidden="true">
              |
            </span>
          ) : null}
        </p>
      )}
    </div>
  );
}
