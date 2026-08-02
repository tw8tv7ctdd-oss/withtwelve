import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronRight, Feather } from "lucide-react";

import { AppShell, ScreenHeading } from "@/components/AppShell";
import { ErrorState, QuietState } from "@/components/common/States";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Conversation } from "@/integrations/supabase/db-types";
import { formatRelativeTime } from "@/lib/date-utils";

const title = "History — WithTwelve";
const description = "Revisit your past conversations with the twelve.";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: HistoryPage,
});

function useConversations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["conversations", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("id, title, last_message_at, created_at")
        .order("last_message_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as Pick<
        Conversation,
        "id" | "title" | "last_message_at" | "created_at"
      >[];
    },
    staleTime: 1000 * 30,
  });
}

function HistoryPage() {
  const { data, isLoading, isError } = useConversations();

  return (
    <AppShell withNav>
      <ScreenHeading
        title="History"
        subtitle="The questions you've brought here before, kept for you."
      />

      {isLoading ? <SkeletonList /> : null}

      {isError ? (
        <ErrorState body="We couldn't gather your conversations just now. Nothing has been lost — please try again in a moment." />
      ) : null}

      {!isLoading && !isError && data && data.length === 0 ? <EmptyState /> : null}

      {!isLoading && !isError && data && data.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {data.map((conversation) => (
            <li key={conversation.id}>
              <Link
                to="/chat/$id"
                params={{ id: conversation.id }}
                className="flex min-h-16 items-center gap-4 rounded-2xl bg-surface px-5 py-4 shadow-sm transition-colors hover:bg-muted/40 active:bg-muted/60"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm leading-relaxed font-medium">
                    {conversation.title?.trim() || "An unnamed reflection"}
                  </span>
                  <span className="mt-1.5 block text-xs text-muted-foreground">
                    {formatRelativeTime(conversation.last_message_at ?? conversation.created_at)}
                  </span>
                </span>
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      {!isLoading && !isError && data && data.length > 0 ? (
        <p className="mt-8 text-center text-xs leading-relaxed text-muted-foreground">
          Your reflections stay here, for as long as you want them.
        </p>
      ) : null}
    </AppShell>
  );
}

function SkeletonList() {
  return (
    <ul className="flex flex-col gap-3" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <li key={i} className="min-h-16 rounded-2xl bg-surface px-5 py-4 shadow-sm">
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-3 w-20 animate-pulse rounded bg-muted" />
        </li>
      ))}
    </ul>
  );
}

function EmptyState() {
  return (
    <QuietState
      tone="centered"
      icon={Feather}
      title="Nothing here yet"
      body="When you bring a question to one of the twelve, the conversation will be kept here for you to return to."
      action={
        <Link
          to="/home"
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Begin a reflection
        </Link>
      }
    />
  );
}
