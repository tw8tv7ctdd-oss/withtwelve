import { Fragment } from "react";

import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, RefreshCw, Unlock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

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
      <PricingVisual />
      <p>A paid plan removes the trial question cap.</p>
      <InfoNote>Full pricing details will appear here.</InfoNote>
    </InfoPage>
  );
}

function PricingVisual() {
  const steps: { icon: LucideIcon; label: string; sub: string; tone: "primary" | "accent" }[] = [
    { icon: CalendarDays, label: "7-day trial", sub: "5 questions/day", tone: "primary" },
    { icon: RefreshCw, label: "Daily rhythm", sub: "Renews at midnight HKT", tone: "accent" },
    { icon: Unlock, label: "Full access", sub: "Continue anytime", tone: "primary" },
  ];

  const circleTone = (tone: "primary" | "accent") =>
    tone === "primary" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent";

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center justify-items-center gap-x-2 gap-y-1">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === steps.length - 1;
          return (
            <Fragment key={step.label}>
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full ${circleTone(step.tone)}`}
              >
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </span>
              {!isLast && <span className="h-px w-6 bg-border" />}
            </Fragment>
          );
        })}
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          return (
            <Fragment key={`${step.label}-label`}>
              <span className="text-center text-[13px] font-medium text-foreground">{step.label}</span>
              {!isLast && <span aria-hidden="true" />}
            </Fragment>
          );
        })}
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          return (
            <Fragment key={`${step.label}-sub`}>
              <span className="text-center text-[12px] leading-snug text-muted-foreground">{step.sub}</span>
              {!isLast && <span aria-hidden="true" />}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
