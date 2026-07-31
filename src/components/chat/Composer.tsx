import { useMemo, useRef, useState } from "react";
import { SendHorizonal } from "lucide-react";

import { MentionDropdown } from "@/components/chat/MentionDropdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Disciple } from "@/integrations/supabase/db-types";

const MAX_LENGTH = 2000;
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
  onMentionSelect?: (id: string | null) => void;
}) {
  const charCount = value.length;
  const isOverLimit = charCount > MAX_LENGTH;
  const isEmpty = value.trim().length === 0;
  const canSend = !disabled && !busy && !isEmpty && !isOverLimit;

  const [mentionOpen, setMentionOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [caret, setCaret] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const query = useMemo(() => {
    if (!mentionOpen) return "";
    const match = value.slice(0, caret).match(MENTION_TOKEN);
    return match?.[1] ?? "";
  }, [mentionOpen, value, caret]);

  const matches = useMemo(() => {
    if (!mentionOpen) return [];
    const q = query.toLowerCase();
    return disciples
      .filter(
        (d) =>
          !q ||
          d.name.toLowerCase().includes(q) ||
          (d.slug ?? "").toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [mentionOpen, disciples, query]);

  const syncMention = (next: string, position: number) => {
    setCaret(position);
    const open = MENTION_TOKEN.test(next.slice(0, position));
    setMentionOpen(open);
    if (!open) setActiveIndex(0);
  };

  const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    onChange(event.target.value);
    syncMention(event.target.value, event.target.selectionStart ?? event.target.value.length);
  };

  const pick = (disciple: Disciple) => {
    const before = value.slice(0, caret);
    const after = value.slice(caret);
    const replaced = before.replace(MENTION_TOKEN, `@${disciple.slug} `);
    const nextValue = replaced + after;
    onChange(nextValue);
    onMentionSelect?.(disciple.id);
    setMentionOpen(false);
    setActiveIndex(0);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(replaced.length, replaced.length);
    });
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    if (mentionOpen && matches.length > 0) {
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
      if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
        pick(matches[activeIndex]);
        return;
      }
    }
    if (event.key === "Escape") {
      setMentionOpen(false);
      return;
    }
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!canSend) return;
      onSend();
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onSelect={(event) =>
            syncMention(value, event.currentTarget.selectionStart ?? 0)
          }
          onBlur={() => setMentionOpen(false)}
          placeholder={placeholder}
          disabled={disabled || busy}
          aria-invalid={isOverLimit}
          className="min-h-28 resize-none"
        />

        {mentionOpen ? (
          <MentionDropdown
            matches={matches}
            activeIndex={activeIndex}
            onPick={pick}
            onHover={setActiveIndex}
          />
        ) : null}
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-0.5">
          {helperText ? (
            <p className="text-xs leading-relaxed text-balance text-muted-foreground">
              {helperText}
            </p>
          ) : null}
          <p
            aria-live="polite"
            className={`text-[11px] leading-relaxed tabular-nums ${
              isOverLimit ? "text-destructive" : "text-muted-foreground/70"
            }`}
          >
            {charCount}/{MAX_LENGTH}
          </p>
        </div>

        <Button
          type="button"
          size="icon"
          aria-label="Ask"
          disabled={!canSend}
          onClick={() => {
            if (!canSend) return;
            onSend();
          }}
          className="shrink-0"
        >
          <SendHorizonal className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
