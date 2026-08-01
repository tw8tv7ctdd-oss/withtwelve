import type { ReactNode } from "react";

/** One surface treatment and one section-label style for the whole app. */
export const surfaceClass = "rounded-3xl bg-surface p-6 shadow-sm";

export const eyebrowClass =
  "text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground";

export function Surface({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section";
}) {
  return <Tag className={`${surfaceClass} ${className}`}>{children}</Tag>;
}

export function SectionLabel({
  children,
  icon,
}: {
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <p className={`flex items-center gap-2 ${eyebrowClass}`}>
      {icon}
      {children}
    </p>
  );
}
