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

