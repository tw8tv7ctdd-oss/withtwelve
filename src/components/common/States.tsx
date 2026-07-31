import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Shared loading / empty / error surfaces so every screen speaks with the
 * same rhythm, spacing and tone.
 */

export function CardSurface({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-3xl bg-surface p-6 shadow-sm ${className}`}>{children}</div>
  );
}

export function LoadingLines({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  const widths = ["w-2/3", "w-full", "w-5/6", "w-1/2"];
  return (
    <div className={`space-y-2.5 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`h-4 animate-pulse rounded-md bg-muted ${widths[i % widths.length]}`} />
      ))}
    </div>
  );
}

export function LoadingCard({ lines = 3 }: { lines?: number }) {
  return (
    <CardSurface>
      <LoadingLines lines={lines} />
      <span className="sr-only">Loading</span>
    </CardSurface>
  );
}

export function QuietState({
  icon: Icon,
  title,
  body,
  action,
  tone = "quiet",
}: {
  icon?: LucideIcon;
  title?: string;
  body: string;
  action?: ReactNode;
  tone?: "quiet" | "centered";
}) {
  if (tone === "centered") {
    return (
      <div className="rounded-3xl bg-surface px-6 py-10 text-center shadow-sm">
        {Icon ? (
          <Icon className="mx-auto h-6 w-6 text-accent" strokeWidth={1.5} aria-hidden="true" />
        ) : null}
        {title ? <p className="mt-4 text-base leading-relaxed font-medium">{title}</p> : null}
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{body}</p>
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
    );
  }

  return (
    <CardSurface>
      <div className="flex items-start gap-3">
        {Icon ? (
          <Icon
            className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        ) : null}
        <div className="min-w-0">
          {title ? <p className="text-sm font-medium text-foreground">{title}</p> : null}
          <p className={`text-sm leading-relaxed text-muted-foreground ${title ? "mt-1" : ""}`}>
            {body}
          </p>
          {action ? <div className="mt-4">{action}</div> : null}
        </div>
      </div>
    </CardSurface>
  );
}

/** Consistent, non-alarming copy for a read that did not come back. */
export function ErrorState({ body, action }: { body: string; action?: ReactNode }) {
  return (
    <div role="status" aria-live="polite">
      <QuietState body={body} action={action} />
    </div>
  );
}