import type { Disciple } from "@/integrations/supabase/db-types";

/**
 * Client-side hint only: finds the first @mention in the prompt that matches an
 * active disciple. The backend keeps final routing authority — this never
 * overrides an explicit selection and never contradicts the returned disciple.
 */
export function findMentionedDiscipleId(text: string, disciples: Disciple[]): string | null {
  const matches = text.match(/@([\p{L}\d_-]+)/gu);
  if (!matches) return null;
  for (const raw of matches) {
    const token = raw.slice(1).toLowerCase();
    const hit = disciples.find(
      (d) => d.slug?.toLowerCase() === token || d.name?.toLowerCase() === token,
    );
    if (hit) return hit.id;
  }
  return null;
}

/** Explicit pick wins, then a valid @mention, then null for backend routing. */
export function resolveDiscipleId(
  selectedId: string | null,
  text: string,
  disciples: Disciple[],
): string | null {
  if (selectedId) return selectedId;
  return findMentionedDiscipleId(text, disciples);
}
