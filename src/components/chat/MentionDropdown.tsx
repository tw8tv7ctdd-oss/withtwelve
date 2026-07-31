import { useEffect } from "react";

import type { Disciple } from "@/integrations/supabase/db-types";

/** A small, mobile-friendly list of disciples shown while typing an @mention. */
export function MentionDropdown({
  matches,
  activeIndex,
  onPick,
  onHover,
}: {
  matches: Disciple[];
  activeIndex: number;
  onPick: (disciple: Disciple) => void;
  onHover: (index: number) => void;
}) {
  useEffect(() => {
    // Keep the highlighted row in view on small screens.
    const el = document.getElementById(`mention-option-${activeIndex}`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (matches.length === 0) {
    return (
      <div className="absolute bottom-full left-0 z-30 mb-2 w-full rounded-2xl border border-border bg-surface p-3 shadow-sm">
        <p className="text-xs leading-relaxed text-muted-foreground">
          No one by that name. Leave it open and it will be given to one of the twelve.
        </p>
      </div>
    );
  }

  return (
    <ul
      role="listbox"
      aria-label="Mention a disciple"
      className="absolute bottom-full left-0 z-30 mb-2 max-h-56 w-full overflow-y-auto rounded-2xl border border-border bg-surface py-1 shadow-sm"
    >
      {matches.map((disciple, index) => (
        <li key={disciple.id}>
          <button
            id={`mention-option-${index}`}
            type="button"
            role="option"
            aria-selected={index === activeIndex}
            onMouseDown={(event) => {
              event.preventDefault();
              onPick(disciple);
            }}
            onMouseEnter={() => onHover(index)}
            className={`flex min-h-11 w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors ${
              index === activeIndex ? "bg-primary/10 text-primary" : "text-foreground"
            }`}
          >
            <span className="truncate">{disciple.name}</span>
            <span className="ml-auto shrink-0 text-xs text-muted-foreground">
              @{disciple.slug}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}