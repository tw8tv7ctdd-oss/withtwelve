import { useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { bottomNavClearance, isChatRoute } from "@/lib/nav";

/** Narrow, centered, mobile-first shell used by every screen. */
export function AppShell({
  children,
  withNav = false,
  className = "",
}: {
  children: ReactNode;
  withNav?: boolean;
  className?: string;
}) {
  const { pathname } = useLocation();

  // Authenticated screens have no footer, so the shell always carries the
  // clearance for the fixed bottom nav.
  const bottomPadding = withNav
    ? bottomNavClearance
    : "pb-[max(2.5rem,env(safe-area-inset-bottom))]";

  void isChatRoute(pathname);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div
        className={`mx-auto flex w-full max-w-md flex-col px-5 pt-[max(2rem,env(safe-area-inset-top))] ${bottomPadding} ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

export function ScreenHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-6">
      <h1 className="text-[22px] leading-snug font-semibold tracking-tight text-balance">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
      ) : null}
    </header>
  );
}
