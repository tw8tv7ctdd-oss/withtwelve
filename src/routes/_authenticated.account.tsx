import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Clock, LogOut, Moon, Sparkles } from "lucide-react";

import { AppShell, ScreenHeading } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { SubscriptionStatus, UsageDaily } from "@/integrations/supabase/db-types";
import { getHktDateStr } from "@/lib/date-utils";
import { DAILY_LIMIT, TRIAL_HOURS } from "@/lib/entitlements";

const title = "Account — WithTwelve";
const description = "Your WithTwelve account, trial timing, and today's reflections.";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AccountPage,
});

function useTodayUsage() {
  const { user } = useAuth();
  const today = getHktDateStr();

  return useQuery({
    queryKey: ["usage-daily", user?.id, today],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("usage_daily")
        .select("question_count")
        .eq("user_id", user.id)
        .eq("date", today)
        .maybeSingle();
      if (error) throw error;
      return (data as Pick<UsageDaily, "question_count"> | null)?.question_count ?? 0;
    },
    staleTime: 1000 * 30,
  });
}

function trialTiming(startedAt: string | null | undefined) {
  if (!startedAt) return null;
  const start = new Date(startedAt);
  if (Number.isNaN(start.getTime())) return null;
  const end = new Date(start.getTime() + TRIAL_HOURS * 3600 * 1000);
  const msLeft = end.getTime() - Date.now();
  const hoursLeft = Math.max(0, Math.floor(msLeft / 3600000));
  const daysLeft = Math.floor(hoursLeft / 24);
  const endLabel = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Hong_Kong",
  }).format(end);
  return { hoursLeft, daysLeft, endLabel, ended: msLeft <= 0 };
}

function AccountPage() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const status: SubscriptionStatus | null = profile?.subscription_status ?? null;
  const usage = useTodayUsage();

  const handleSignOut = async () => {
    await signOut();
    void navigate({ to: "/" });
  };

  return (
    <AppShell withNav>
      <ScreenHeading
        title="Account"
        subtitle="A quiet summary of where you are, and how much you have asked today."
      />

      <section className="rounded-3xl bg-surface p-6 shadow-sm">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">You</h2>
        {loading ? (
          <>
            <div className="mt-4 h-5 w-32 animate-pulse rounded-md bg-muted" />
            <div className="mt-2 h-4 w-44 animate-pulse rounded-md bg-muted" />
          </>
        ) : (
          <>
            <p className="mt-3 text-base text-foreground">{profile?.preferred_name ?? "Friend"}</p>
            <p className="mt-1 text-sm break-words text-muted-foreground">
              {user?.email ?? "No email on record"}
            </p>
          </>
        )}
      </section>

      <StatusSection status={status} trialStartedAt={profile?.trial_started_at} loading={loading} />

      <UsageSection
        status={status}
        count={usage.data ?? null}
        isLoading={usage.isLoading}
        isError={usage.isError}
      />

      <div className="mt-8 mb-4">
        <Button
          type="button"
          variant="outline"
          className="h-12 w-full rounded-2xl border-border bg-surface"
          onClick={() => void handleSignOut()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
        <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
          Your conversations stay here, waiting, whenever you sign back in.
        </p>
      </div>
    </AppShell>
  );
}

function StatusSection({
  status,
  trialStartedAt,
  loading,
}: {
  status: SubscriptionStatus | null;
  trialStartedAt: string | null | undefined;
  loading: boolean;
}) {
  const timing = trialTiming(trialStartedAt);

  let icon = <Sparkles className="h-4 w-4 text-accent" />;
  let heading = "Your time here";
  let body = "We are still gathering your plan details.";

  if (!loading && status === "active") {
    icon = <CheckCircle2 className="h-4 w-4 text-primary" />;
    heading = "Your subscription is active";
    body = "You are free to ask whenever something is on your heart. No daily limit applies.";
  } else if (!loading && status === "trial") {
    icon = <Clock className="h-4 w-4 text-primary" />;
    heading = "You are in your trial week";
    body = timing
      ? timing.ended
        ? "Your seven-day trial window has passed. The backend will confirm what comes next."
        : timing.daysLeft >= 1
          ? `About ${timing.daysLeft} ${timing.daysLeft === 1 ? "day" : "days"} left of your seven-day trial, ending around ${timing.endLabel} (Hong Kong time).`
          : `About ${timing.hoursLeft} ${timing.hoursLeft === 1 ? "hour" : "hours"} left of your seven-day trial, ending around ${timing.endLabel} (Hong Kong time).`
      : "Your trial runs for seven days. We do not have a start time recorded yet.";
  } else if (!loading && (status === "expired" || status === "cancelled")) {
    icon = <Moon className="h-4 w-4 text-muted-foreground" />;
    heading = status === "expired" ? "Your trial has ended" : "Your subscription has ended";
    body =
      "New questions are paused for now. Your past reflections remain here whenever you would like to return to them.";
  }

  return (
    <section className="mt-4 rounded-3xl bg-surface p-6 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {icon}
        Status
      </div>
      {loading ? (
        <>
          <div className="mt-4 h-5 w-40 animate-pulse rounded-md bg-muted" />
          <div className="mt-2.5 h-4 w-full animate-pulse rounded-md bg-muted" />
        </>
      ) : (
        <>
          <p className="mt-3 text-base text-foreground">{heading}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
        </>
      )}
      {!loading && status === "trial" ? (
        <p className="mt-3 text-xs text-muted-foreground">
          During the trial you may ask up to {DAILY_LIMIT} questions each day, resetting at midnight
          Hong Kong time.
        </p>
      ) : null}
    </section>
  );
}

function UsageSection({
  status,
  count,
  isLoading,
  isError,
}: {
  status: SubscriptionStatus | null;
  count: number | null;
  isLoading: boolean;
  isError: boolean;
}) {
  const showRemaining = status === "trial" && typeof count === "number";
  const remaining = showRemaining ? Math.max(0, DAILY_LIMIT - (count ?? 0)) : null;

  return (
    <section className="mt-4 rounded-3xl bg-surface p-6 shadow-sm">
      <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Today (Hong Kong time)
      </h2>
      {isLoading ? (
        <div className="mt-4 h-5 w-40 animate-pulse rounded bg-muted" />
      ) : isError || count === null ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          We could not read today's activity just now. Your standing with the twelve is unchanged.
        </p>
      ) : (
        <>
          <p className="mt-3 text-base text-foreground">
            {count === 0
              ? "You have not asked anything yet today."
              : `${count} ${count === 1 ? "question" : "questions"} asked today.`}
          </p>
          {showRemaining ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Around {remaining} {remaining === 1 ? "question" : "questions"} left today, as shown
              here. The final word rests with the server when you ask.
            </p>
          ) : status === "active" ? (
            <p className="mt-2 text-sm text-muted-foreground">No daily cap applies to you.</p>
          ) : null}
        </>
      )}
    </section>
  );
}
