import type { ReactNode } from "react";

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
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div
        className={`mx-auto flex w-full max-w-md flex-col px-5 pt-8 ${withNav ? "pb-28" : "pb-10"} ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

export function ScreenHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl leading-snug font-semibold tracking-tight">{title}</h1>
      {subtitle ? <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p> : null}
    </header>
  );
}