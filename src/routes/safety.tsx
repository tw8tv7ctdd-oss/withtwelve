import { createFileRoute } from "@tanstack/react-router";

import { AppShell, ScreenHeading } from "@/components/AppShell";

const title = "Safety — WithTwelve";
const description = "How WithTwelve handles sensitive moments and care.";

export const Route = createFileRoute("/safety")({
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
  component: SafetyPage,
});

function SafetyPage() {
  return (
    <AppShell>
      <ScreenHeading title="Safety" />
    </AppShell>
  );
}
