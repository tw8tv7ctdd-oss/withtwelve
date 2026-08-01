import { createFileRoute } from "@tanstack/react-router";

import { AppShell, ScreenHeading } from "@/components/AppShell";

const title = "Pricing — WithTwelve";
const description = "Plans and pricing for WithTwelve.";

export const Route = createFileRoute("/pricing")({
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
  component: PricingPage,
});

function PricingPage() {
  return (
    <AppShell>
      <ScreenHeading title="Pricing" />

      <section className="px-6 py-2">
        <div className="bg-surface rounded-2xl p-6 shadow-sm space-y-5">
          <p className="text-[15px] leading-relaxed text-text">
            WithTwelve begins with a 7-day trial.
          </p>

          <p className="text-[15px] leading-relaxed text-text">
            During the trial, you can ask up to 5 questions each day, resetting at midnight Hong Kong time.
          </p>

          <p className="text-[15px] leading-relaxed text-text">
            A paid plan removes the trial question cap.
          </p>

          <p className="text-[13px] leading-relaxed text-muted-foreground">
            Full pricing details will appear here.
          </p>
        </div>
      </section>
    </AppShell>
  );
}
