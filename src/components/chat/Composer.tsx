import { SendHorizonal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/** The single place a question is written. Send is owned by the chat screen. */
export function Composer({
  value,
  onChange,
  onSend,
  disabled = false,
  busy = false,
  placeholder = "Ask what's on your heart…",
  helperText,
}: {
  value: string;
  onChange: (next: string) => void;
  onSend: () => void;
  disabled?: boolean;
  busy?: boolean;
  placeholder?: string;
  helperText?: string;
}) {
  const canSend = !disabled && !busy && value.trim().length > 0;

  return (
    <form
      className={`rounded-2xl border border-border bg-surface p-3 shadow-sm transition-opacity focus-within:border-primary/40 ${
        disabled ? "opacity-70" : ""
      }`}
      onSubmit={(event) => {
        event.preventDefault();
        if (canSend) onSend();
      }}
    >
      <label htmlFor="composer" className="sr-only">
        Your question
      </label>
      <Textarea
        id="composer"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault();
            if (canSend) onSend();
          }
        }}
        placeholder={disabled ? "New questions are paused for now." : placeholder}
        disabled={disabled}
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
