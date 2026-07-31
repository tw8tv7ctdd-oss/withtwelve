import { useMemo, useRef, useState } from "react";
import { SendHorizonal } from "lucide-react";

import { MentionDropdown } from "@/components/chat/MentionDropdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Disciple } from "@/integrations/supabase/db-types";

const MENTION_TOKEN = /@([\p{L}\d_-]*)$/u;

/** The single place a question is written. Send is owned by the chat screen. */
export function Composer({
  value,
  onChange,
  onSend,
  disabled = false,
  busy = false,
  placeholder = "Ask what's on your heart…",
  helperText,
  disciples = [],
  onMentionSelect,
}: {
  value: string;
  onChange: (next: string) => void;
  onSend: () => void;
  disabled?: boolean;
  busy?: boolean;
  placeholder?: string;
  helperText?: string;
  disciples?: Disciple[];
  onMentionSelect?: (discipleId: string) => void;
}) {
  const MAX_LENGTH = 2000;
  const charCount = value.length;
  const isOverLimit = charCount > MAX_LENGTH;
  const isEmpty = value.trim().length === 0;
  const canSend = !disabled && !busy && !isEmpty && !isOverLimit;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [query, setQuery] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);


  const matches = useMemo(() => {
    if (query === null) return [];
    const q = query.toLowerCase();
    return disciples
      .filter((d) => d.is_active)
      .filter(
        (d) =>
          !q ||
          d.slug?.toLowerCase().startsWith(q) ||
          d.name?.toLowerCase().startsWith(q) ||
          d.name?.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [disciples, query]);

  const open = query !== null && !disabled;

  const syncMention = (next: string, cursor: number) => {
    const match = MENTION_TOKEN.exec(next.slice(0, cursor));
    setQuery(match ? match[1] : null);
    setActiveIndex(0);
  };

  const pick = (disciple: Disciple) => {
    const el = textareaRef.current;
    const cursor = el?.selectionStart ?? value.length;
    const before = value.slice(0, cursor);
    const match = MENTION_TOKEN.exec(before);
    if (!match) return;
    const start = cursor - match[0].length;
    const insert = `@${disciple.slug} `;
    const next = value.slice(0, start) + insert + value.slice(cursor);
    onChange(next);
    onMentionSelect?.(disciple.id);
    setQuery(null);
    requestAnimationFrame(() => {
      const pos = start + insert.length;
      el?.focus();
      el?.setSelectionRange(pos, pos);
    });
  };

  return (
    <form
      className={`relative rounded-2xl border border-border bg-surface p-3 shadow-sm transition-opacity focus-within:border-primary/40 ${
        disabled ? "opacity-70" : ""
      }`}
      onSubmit={(event) => {
        event.preventDefault();
        if (canSend) onSend();
      }}
    >
      {open ? (
        <MentionDropdown
          matches={matches}
          activeIndex={activeIndex}
          onPick={pick}
          onHover={setActiveIndex}
        />
      ) : null}
      <label htmlFor="composer" className="sr-only">
        Your question
      </label>
      <Textarea
        id="composer"
        ref={textareaRef}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          syncMention(event.target.value, event.target.selectionStart ?? 0);
        }}
        onClick={(event) =>
          syncMention(value, (event.target as HTMLTextAreaElement).selectionStart ?? 0)
        }
        onBlur={() => setQuery(null)}
        onKeyDown={(event) => {
          if (open && matches.length > 0) {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((i) => (i + 1) % matches.length);
              return;
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((i) => (i - 1 + matches.length) % matches.length);
              return;
            }
            if ((event.key === "Enter" || event.key === "Tab") && !event.shiftKey) {
              event.preventDefault();
              pick(matches[activeIndex]);
              return;
            }
          }
          if (event.key === "Escape" && open) {
            event.preventDefault();
            setQuery(null);
            return;
          }
          if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault();
            if (canSend) onSend();
          }
        }}
        placeholder={disabled ? "New questions are paused for now." : placeholder}
        disabled={disabled}
        aria-invalid={isOverLimit}
        rows={3}
        className="resize-none border-0 bg-transparent p-0 text-sm leading-relaxed shadow-none focus-visible:ring-0 disabled:cursor-not-allowed"
      />
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="min-w-0 flex-1 text-xs leading-relaxed text-muted-foreground">{helperText}</p>
        <Button
          type="submit"
          size="sm"
          disabled={!canSend}
          className="h-10 shrink-0 rounded-2xl px-4"
          aria-label={busy ? "Waiting for a reply" : "Send your question"}
        >
          <SendHorizonal className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          {busy ? "Listening…" : "Ask"}
        </Button>
      </div>
    </form>
  );
}
