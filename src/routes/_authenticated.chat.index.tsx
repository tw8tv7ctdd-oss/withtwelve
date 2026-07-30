import { createFileRoute } from "@tanstack/react-router";

import { AppShell, ScreenHeading } from "@/components/AppShell";

const title = "New conversation — WithTwelve";
const description = "Start a new conversation with one of the twelve disciples.";

export const Route = createFileRoute("/_authenticated/chat/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: NewChatPage,
});

function NewChatPage() {
  return (
    <AppShell withNav>
      <ScreenHeading title="New conversation" subtitle="Ask what's on your heart." />
      <div className="rounded-2xl bg-surface p-6 shadow-sm">
        <p className="text-sm leading-relaxed text-muted-foreground">
          The chat composer and streaming reply arrive in the final step.
        </p>
      </div>
    </AppShell>
  );
}