import { createFileRoute } from "@tanstack/react-router";

import { AppShell, ScreenHeading } from "@/components/AppShell";

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

function HistoryPage() {
  return (
    <AppShell withNav>
      <ScreenHeading title="History" subtitle="Conversations you've had before." />
      <div className="rounded-2xl bg-surface p-6 shadow-sm">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Your conversation list arrives in a later step.
        </p>
      </div>
    </AppShell>
  );
}