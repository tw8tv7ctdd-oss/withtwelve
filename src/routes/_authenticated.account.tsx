import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Clock, CreditCard, LogOut, Moon, Sparkles } from "lucide-react";



import { AppShell, ScreenHeading } from "@/components/AppShell";
import { SectionLabel, surfaceClass } from "@/components/common/Surface";
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

      <section className={surfaceClass}>
        <SectionLabel>You</SectionLabel>
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

      <SubscriptionSection
        status={status}
        trialStartedAt={profile?.trial_started_at}
        usedToday={usage.data ?? null}
        loading={loading}
      />

      <div className="mt-8">
        <Button
          type="button"
          variant="outline"
          className="h-12 w-full rounded-2xl border-border bg-surface"
          onClick={() => void handleSignOut()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
        <p className="mt-8 text-center text-xs leading-relaxed text-muted-foreground">
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
  let body = "We’re checking your account status. Please refresh in a moment.";

  if (!loading && status === "trial" && timing) {
    if (timing.ended) {
      icon = <Moon className="h-4 w-4 text-muted-foreground" />;
      body = "Your trial has ended. To continue asking new questions, please upgrade when billing becomes available.";
    } else {
      icon = <Clock className="h-4 w-4 text-primary" />;
      body = `Your trial ends on ${timing.endLabel} Hong Kong time (UTC+8).`;
    }
  } else if (!loading && (status === "expired" || status === "cancelled")) {
    icon = <Moon className="h-4 w-4 text-muted-foreground" />;
    body = "Your trial has ended. To continue asking new questions, please upgrade when billing becomes available.";
  }

  return (
    <section className={`mt-4 ${surfaceClass}`}>
      <SectionLabel icon={icon}>Status</SectionLabel>
      {loading ? (
        <div className="mt-3 h-4 w-full animate-pulse rounded-md bg-muted" />
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
      )}
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
    <section className={`mt-4 ${surfaceClass}`}>
      <SectionLabel>Today, Hong Kong time (UTC+8)</SectionLabel>
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
              About {remaining} {remaining === 1 ? "question" : "questions"} left today. Your
              questions renew at midnight Hong Kong time (UTC+8).
            </p>
          ) : status === "active" ? (
            <p className="mt-2 text-sm text-muted-foreground">No daily cap applies to you.</p>
          ) : null}
        </>
      )}
    </section>
  );
}

function SubscriptionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-2.5 last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm text-foreground">{value}</span>
    </div>
  );
}

function SubscriptionSection({
  status,
  trialStartedAt,
  usedToday,
  loading,
}: {
  status: SubscriptionStatus | null;
  trialStartedAt: string | null | undefined;
  usedToday: number | null;
  loading: boolean;
}) {
  const timing = trialTiming(trialStartedAt);
  const isTrial = status === "trial";

  const planLabel =
    status === "active" ? "WithTwelve, full plan" : isTrial ? "Trial" : "No active plan";

  const statusLabel =
    status === "active"
      ? "Active"
      : status === "trial"
        ? "Trial"
        : status === "expired"
          ? "Expired"
          : status === "cancelled"
            ? "Cancelled"
            : "Not known yet";

  const trialDaysLeft = isTrial
    ? timing
      ? timing.ended
        ? "None left"
        : timing.daysLeft >= 1
          ? `${timing.daysLeft} ${timing.daysLeft === 1 ? "day" : "days"}`
          : `${timing.hoursLeft} ${timing.hoursLeft === 1 ? "hour" : "hours"}`
      : "Not recorded"
    : "Not applicable";

  const questionsLeft = isTrial
    ? typeof usedToday === "number"
      ? `${Math.max(0, DAILY_LIMIT - usedToday)} of ${DAILY_LIMIT}`
      : "Not available"
    : status === "active"
      ? "No daily cap"
      : "Not applicable";

  const dateLabel = isTrial
    ? timing
      ? `Trial ends ${timing.endLabel} Hong Kong time (UTC+8)`
      : "Not recorded"
    : status === "active"
      ? "Shown here once billing is connected"
      : "Not applicable";

  return (
    <section className={`mt-4 ${surfaceClass}`}>
      <SectionLabel icon={<CreditCard className="h-4 w-4 text-primary" />}>
        Subscription
      </SectionLabel>
      {loading ? (
        <div className="mt-4 space-y-3">
          <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-2/3 animate-pulse rounded-md bg-muted" />
        </div>
      ) : (
        <>
          <div className="mt-3">
            <SubscriptionRow label="Current plan" value={planLabel} />
            <SubscriptionRow label="Status" value={statusLabel} />
            <SubscriptionRow label="Trial left" value={trialDaysLeft} />
            <SubscriptionRow label="Questions left today" value={questionsLeft} />
            <SubscriptionRow label={isTrial ? "Trial ends" : "Next billing date"} value={dateLabel} />
            <SubscriptionRow label="Current price" value="Shown here once billing is connected" />
          </div>

          <Button
            type="button"
            variant="outline"
            disabled
            className="mt-5 h-12 w-full rounded-2xl border-border bg-surface"
          >
            Manage subscription
          </Button>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Billing is not connected yet. When it is, this will open your secure payment portal.
          </p>
        </>
      )}
    </section>
  );
}
