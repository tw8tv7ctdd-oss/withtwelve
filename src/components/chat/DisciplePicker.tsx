import { Check, Users } from "lucide-react";

import type { Disciple } from "@/integrations/supabase/db-types";

/**
 * Placement: a single quiet row directly above the composer.
 * Precedence is UI hinting only — explicit pick, else an @mention in the text,
 * else `selected_disciple_id: null` and the backend routes.
 */
export function DisciplePicker({
  disciples,
  selectedId,
  onSelect,
  disabled = false,
}: {
  disciples: Disciple[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect(null)}
        className={`flex shrink-0 items-center gap-1.5 rounded-2xl border border-border px-3 py-1.5 text-xs transition-colors disabled:opacity-50 ${
          selectedId === null ? "bg-primary/10 text-primary" : "bg-surface text-muted-foreground"
        }`}
      >
        <Users className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
        Let it be given
      </button>

      {disciples.map((disciple) => (
        <button
          key={disciple.id}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(disciple.id)}
          className={`flex shrink-0 items-center gap-1.5 rounded-2xl border border-border px-3 py-1.5 text-xs transition-colors disabled:opacity-50 ${
            selectedId === disciple.id
              ? "bg-primary/10 text-primary"
              : "bg-surface text-muted-foreground"
          }`}
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