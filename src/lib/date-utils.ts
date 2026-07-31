/**
 * Hong Kong time helpers for the WithTwelve daily usage and prompt model.
 * The daily reset uses HKT (UTC+8), distinct from the rolling 7-day trial window.
 */

export function getHktDateStr(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Hong_Kong" }).format(date);
}

export function getHktDateParts(date = new Date()): {
  year: number;
  month: number;
  day: number;
  hour: number;
} {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return {
    year: get("year") ?? 0,
    month: get("month") ?? 0,
    day: get("day") ?? 0,
    hour: get("hour") ?? 0,
  };
}

export function getTimeOfDayGreeting(date = new Date()): "morning" | "afternoon" | "evening" {
  const { hour } = getHktDateParts(date);
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

/** Warm, human-readable "last activity" label for conversation rows. */
export function formatRelativeTime(value: string | null | undefined): string {
  if (!value) return "No activity yet";
  const then = new Date(value);
  if (Number.isNaN(then.getTime())) return "No activity yet";

  const diffMs = Date.now() - then.getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    ...(then.getFullYear() === new Date().getFullYear() ? {} : { year: "numeric" }),
  }).format(then);
}

