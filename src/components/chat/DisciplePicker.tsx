import { Check, Users } from "lucide-react";

import type { Disciple } from "@/integrations/supabase/db-types";

/**
 * A quiet row directly above the composer. Precedence is UI hinting only —
 * explicit pick, else an @mention in the text, else the backend routes.
 */
export function DisciplePicker({
  disciples,
  selectedId,
  onSelect,
  disabled = false,
  loading = false,
}: {
  disciples: Disciple[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const chip = (active: boolean) =>
    `flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs leading-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-45 ${
      active
        ? "border-primary/30 bg-primary/10 text-primary"
        : "border-border bg-surface text-muted-foreground hover:text-foreground"
    }`;

  if (loading) {
    return (
      <div className="flex flex-wrap gap-x-2 gap-y-1.5" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-9 w-24 animate-pulse rounded-full bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div
      className="flex flex-wrap gap-x-2 gap-y-1.5"
      role="group"
      aria-label="Choose who answers"
    >
      <button
        type="button"
        disabled={disabled}
        aria-pressed={selectedId === null}
        onClick={() => onSelect(null)}
        className={chip(selectedId === null)}
      >
        <Users className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
        Let it be given
      </button>

      {disciples.map((disciple) => (
        <button
          key={disciple.id}
          type="button"
          disabled={disabled}
          aria-pressed={selectedId === disciple.id}
          onClick={() => onSelect(selectedId === disciple.id ? null : disciple.id)}
          className={chip(selectedId === disciple.id)}
        >
          {selectedId === disciple.id ? (
            <Check className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
          ) : null}
          {disciple.name}
        </button>
      ))}
    </div>
  );
}
