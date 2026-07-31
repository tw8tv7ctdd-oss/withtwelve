import type { SubscriptionStatus } from "@/integrations/supabase/db-types";

/** Trial allowance, mirrored from the backend rules. Read-only on the client. */
export const DAILY_LIMIT = 5;
export const TRIAL_HOURS = 168;

/** Statuses that pause new questions. The server remains authoritative. */
export function isEntitlementBlocked(status: SubscriptionStatus | string | null | undefined) {
  return status === "expired" || status === "cancelled";
}

/** One short line describing where the reader stands, used across screens. */
export function entitlementSummary(status: SubscriptionStatus | string | null | undefined) {
  switch (status) {
    case "active":
      return "Your subscription is active.";
    case "trial":
      return "You are in your trial week.";
    case "expired":
      return "Your trial has ended.";
    case "cancelled":
      return "Your subscription has ended.";
    default:
      return "We are still gathering your details.";
  }
}