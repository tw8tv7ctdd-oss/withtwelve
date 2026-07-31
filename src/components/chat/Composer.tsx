import { SendHorizonal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/**
 * Structure only for this milestone: `onSend` is supplied by the route and is
 * a no-op until the streaming send flow is wired in the next step.
 */
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
      className="rounded-2xl border border-border bg-surface p-3 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        if (canSend) onSend();
      }}
    >
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={3}
        className="resize-none border-0 bg-transparent p-0 text-sm leading-relaxed shadow-none focus-visible:ring-0"
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">{helperText}</p>
        <Button type="submit" size="sm" disabled={!canSend} className="rounded-2xl">
          <SendHorizonal className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          {busy ? "Listening…" : "Ask"}
        </Button>
      </div>
    </form>
  );
}