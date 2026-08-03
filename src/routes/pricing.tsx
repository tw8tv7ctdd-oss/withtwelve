import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, RefreshCw, Unlock } from "lucide-react";

import { InfoNote, InfoPage } from "@/components/InfoPage";

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
    <InfoPage
      title="Pricing"
      intro="A trial to begin with, and a simple plan when you would like to continue."
    >
      <p>WithTwelve begins with a 7-day trial.</p>
      <p>
        During the trial, you can ask up to 5 questions a day. Your questions renew each day at
        midnight Hong Kong time (UTC+8), wherever you are in the world.
      </p>
      <p>A paid plan removes the trial question cap.</p>
      <InfoNote>Full pricing details will appear here.</InfoNote>
    </InfoPage>
  );
}
