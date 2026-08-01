import type { ReactNode } from "react";

import { AppShell } from "@/components/AppShell";

/**
 * Shared layout for the footer-linked informational pages
 * (/about, /pricing, /privacy, /terms, /safety, /contact).
 * One surface treatment, one title style, one paragraph rhythm.
 */
export function InfoPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <AppShell>
      <header className="mb-6">
        <h1 className="text-[24px] leading-[1.2] font-semibold tracking-tight text-balance text-foreground">
          {title}
        </h1>
        {intro ? (
          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{intro}</p>
        ) : null}
      </header>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="space-y-5 text-[16px] leading-relaxed text-foreground">{children}</div>
      </section>
    </AppShell>
  );
}

/** Quiet closing note, consistent across informational pages. */
export function InfoNote({ children }: { children: ReactNode }) {
  return <p className="text-[13px] leading-relaxed text-muted-foreground">{children}</p>;
}

/** Inline link styling shared by the informational pages. */
export const infoLinkClass =
  "font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80";
