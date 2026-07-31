import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Clock, History, MessageCircle, Sparkles } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { DailyPrompt, UsageDaily } from "@/integrations/supabase/db-types";
import { getHktDateStr, getTimeOfDayGreeting } from "@/lib/date-utils";
import { DAILY_LIMIT, isEntitlementBlocked } from "@/lib/entitlements";

const title = "Today — WithTwelve";
const description = "Your daily prompt and a quiet place to begin a conversation.";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { profile, loading: authLoading } = useAuth();

  return (
    <AppShell withNav>
      <GreetingSection profile={profile} loading={authLoading} />
      <DailyPromptCard />
      <ActionsSection status={profile?.subscription_status ?? "trial"} />
      <StatusBanner status={profile?.subscription_status ?? "trial"} />
    </AppShell>
  );
}

function GreetingSection({
  profile,
  loading,
}: {
  profile: { preferred_name: string | null } | null;
  loading: boolean;
}) {
  const greeting = getTimeOfDayGreeting();
  const name = profile?.preferred_name;

  return (
    <header className="mb-6">
      {loading ? (
        <div className="h-7 w-2/3 animate-pulse rounded-md bg-muted" />
      ) : (
        <h1 className="text-2xl leading-snug font-semibold tracking-tight text-balance">
          Good {greeting}
          {name ? `, ${name}` : ", friend"}
        </h1>
      )}
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        A quiet place to bring your questions.
      </p>
    </header>
  );
}

function useDailyPrompt() {
  return useQuery({
    queryKey: ["daily-prompt", getHktDateStr()],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_daily_prompt_hkt");
      if (error) throw error;
      return ((data as DailyPrompt[] | null) ?? [])[0] ?? null;
    },
    staleTime: 1000 * 60 * 5,
  });
}

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
      return ((data as Pick<UsageDaily, "question_count"> | null)?.question_count ?? 0) as number;
    },
    staleTime: 1000 * 30,
  });
}

function DailyPromptCard() {
  const { data: prompt, isLoading } = useDailyPrompt();

  if (isLoading) {
    return (
      <div className="mb-6 rounded-3xl bg-surface p-6 shadow-sm" aria-hidden="true">
        <div className="h-3.5 w-24 animate-pulse rounded-md bg-muted" />
        <div className="mt-5 h-5 w-full animate-pulse rounded-md bg-muted" />
        <div className="mt-2.5 h-5 w-5/6 animate-pulse rounded-md bg-muted" />
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="mb-6 rounded-3xl bg-surface p-6 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          Daily prompt
        </div>
        <p className="mt-4 text-base leading-relaxed text-foreground">
          What is on your heart today? Bring your question, and one of the twelve will sit with you.
        </p>
      </div>
    );
  }

  return (
    <Link
      to="/chat"
      className="group mb-6 block rounded-3xl bg-surface p-6 shadow-sm transition-shadow hover:shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          Daily prompt
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
      <p className="mt-4 text-lg leading-relaxed font-medium text-foreground">
        {prompt.prompt_text}
      </p>
      <p className="mt-3 text-sm text-muted-foreground">Tap to begin reflecting on this.</p>
    </Link>
  );
}

function ActionsSection({ status }: { status: string }) {
  const isLocked = isEntitlementBlocked(status);

  return (
    <div className="mb-6 grid gap-3">
      {isLocked ? (
        <div className="rounded-2xl bg-muted/60 p-5">
          <p className="text-sm font-medium text-foreground">New questions are paused</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Your past reflections remain here whenever you would like to return to them.
          </p>
          <Link
            to="/account"
            className="mt-3 inline-flex min-h-9 items-center text-sm text-primary underline-offset-4 hover:underline"
          >
            View your account
          </Link>
        </div>
      ) : (
        <Button
          asChild
          className="h-auto w-full justify-between rounded-3xl py-4 pr-5 pl-6 text-base shadow-sm"
        >
          <Link to="/chat">
            <span className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5" />
              Ask a question
            </span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
      )}

      <Button
        variant="outline"
        asChild
        className="h-auto w-full justify-between rounded-3xl border-border bg-surface py-4 pr-5 pl-6 text-base"
      >
        <Link to="/history">
          <span className="flex items-center gap-3">
            <History className="h-5 w-5" />
            Continue a conversation
          </span>
          <ArrowRight className="h-5 w-5" />
        </Link>
      </Button>
    </div>
  );
}

function StatusBanner({ status }: { status: string }) {
  const { data: usage } = useTodayUsage();
  const isActive = status === "active";
  const isTrial = status === "trial";
  const isLimited = isTrial;

  if (isActive) return null;

  if (isLimited) {
    const used = usage ?? 0;
    const remaining = Math.max(0, DAILY_LIMIT - used);
    return (
      <div className="flex items-start gap-3 rounded-2xl bg-muted/60 p-4">
        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div className="min-w-0 text-sm leading-relaxed text-muted-foreground">
          <p>
            You are in your trial week.{" "}
            {remaining === 0 ? (
              <span className="font-medium text-foreground">
                You have asked all of today's questions.
              </span>
            ) : (
              <>
                Today you can ask about{" "}
                <span className="font-medium text-foreground">{remaining} more</span>.
              </>
            )}
          </p>
          <p className="mt-1 text-xs">The daily limit resets around midnight in Hong Kong time.</p>
        </div>
      </div>
    );
  }

  // expired / cancelled
  return (
    <div className="rounded-2xl bg-muted/60 p-4 text-sm leading-relaxed text-muted-foreground">
      Your subscription is no longer active. New questions are paused for now.
    </div>
  );
}
