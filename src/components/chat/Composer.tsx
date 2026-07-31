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
  disciples,
  selectedDisciple,
  onSelectDisciple,
}: {
  value: string;
  onChange: (next: string) => void;
  onSend: () => void;
  disabled?: boolean;
  busy?: boolean;
  placeholder?: string;
  helperText?: string;
  disciples?: Disciple[];
  selectedDisciple?: Disciple | null;
  onSelectDisciple?: (disciple: Disciple | null) => void;
}) {
  const MAX_LENGTH = 2000;

  const charCount = value.length;
  const isOverLimit = charCount > MAX_LENGTH;
  const isEmpty = value.trim().length === 0;
  const canSend = !disabled && !busy && !isEmpty && !isOverLimit;

  const [mentionOpen, setMentionOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const mentionQuery = useMemo(() => {
    const match = value.match(MENTION_TOKEN);
    return match?.[1] ?? "";
  }, [value]);

  const handleChange = (next: string) => {
    onChange(next);

    const match = next.match(MENTION_TOKEN);
    setMentionOpen(Boolean(match && match[1]));
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (
    event,
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!canSend) return;
      onSend();
    }
  };

  const handleSendClick = () => {
    if (!canSend) return;
    onSend();
  };

  const handleSelectDisciple = (disciple: Disciple | null) => {
    onSelectDisciple?.(disciple);
    setMentionOpen(false);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => handleChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || busy}
          aria-invalid={isOverLimit}
          className="min-h-[120px] resize-none"
        />

        {mentionOpen && disciples && disciples.length > 0 && (
          <MentionDropdown
            query={mentionQuery}
            disciples={disciples}
            selectedDisciple={selectedDisciple ?? null}
            onSelect={handleSelectDisciple}
          />
        )}
      </div>

      <div className="flex items-center gap-3">
        <p className="min-w-0 flex-1 text-xs leading-relaxed text-muted-foreground">
          {helperText}
          {helperText ? <span className="mx-1">·</span> : null}
          <span
            aria-live="polite"
            className={isOverLimit ? "font-medium text-destructive" : ""}
          >
            {charCount}/{MAX_LENGTH}
          </span>
        </p>

        <Button
          type="button"
          size="icon"
          disabled={!canSend}
          onClick={handleSendClick}
        >
          <SendHorizonal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
