import type { ReactNode } from "react";

import { AppShell } from "@/components/AppShell";
import { SiteHeader } from "@/components/SiteHeader";

/**
 * Shared layout for the secondary informational pages
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
    <>
      <SiteHeader width="max-w-lg" />
      <AppShell className="max-w-lg">
        <header className="mb-4">
          <h1 className="font-serif text-[21px] font-normal leading-[1.2] tracking-tight text-balance text-foreground">
            {title}
          </h1>
          {intro ? (
            <p className="mt-2 text-[15px] leading-relaxed text-foreground/80">{intro}</p>
          ) : null}
        </header>

        <section className="space-y-5 text-[15px] leading-relaxed text-foreground">
          {children}
        </section>
      </AppShell>
    </>
  );
}


/** Quiet closing note, consistent across informational pages. */
export function InfoNote({ children }: { children: ReactNode }) {
  return (
    <p className="mt-2 border-t border-border pt-5 text-[15px] leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}

/** Inline link styling shared by the informational pages. */
export const infoLinkClass =
  "font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80";
