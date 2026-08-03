import { Fragment } from "react";

import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, RefreshCw, Unlock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { InfoPage } from "@/components/InfoPage";

const title = "Pricing — WithTwelve";
const description =
  "Pricing for WithTwelve: 7-day free trial, no credit card required, then $10/month.";

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
      intro="One simple plan. Try it for a week, then continue only if it is helping."
    >
      <ul className="space-y-1 text-[15px] leading-relaxed text-foreground">
        <li className="before:mr-2 before:content-['-']">7-day free trial</li>
        <li className="before:mr-2 before:content-['-']">No credit card required</li>
        <li className="before:mr-2 before:content-['-']">5 questions per day during trial</li>
        <li className="before:mr-2 before:content-['-']">Then $10/month</li>
        <li className="before:mr-2 before:content-['-']">Cancel anytime</li>
      </ul>

      <PricingVisual />

      <div className="space-y-4">
        <h2 className="font-serif text-[18px] font-normal leading-[1.25] tracking-tight text-foreground">
          FAQ
        </h2>
        <div className="space-y-4 text-[15px] leading-relaxed">
          <div>
            <p className="font-medium text-foreground">What happens when the trial ends?</p>
            <p className="mt-1 text-muted-foreground">
              You can still view your message history in your account, but you will not be able to send
              or receive new messages unless you subscribe.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">Is there a contract?</p>
            <p className="mt-1 text-muted-foreground">
              No. There is no contract, and you can cancel anytime.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">Can I cancel anytime?</p>
            <p className="mt-1 text-muted-foreground">
              Yes. If you cancel, your subscription stays active until the end of the current billing
              period and then ends before the next payment.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">Where do I manage billing?</p>
            <p className="text-muted-foreground">In your Account page.</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Will I be charged during the free trial?</p>
            <p className="text-muted-foreground">No. The 7-day trial does not require a credit card.</p>
          </div>
        </div>
      </div>
    </InfoPage>
  );
}

function PricingVisual() {
  const steps: { icon: LucideIcon; label: string; sub: string; tone: "primary" | "accent" }[] = [
    { icon: CalendarDays, label: "7-day trial", sub: "5 questions/day", tone: "primary" },
    { icon: RefreshCw, label: "Daily rhythm", sub: "Renews at midnight HKT", tone: "accent" },
    { icon: Unlock, label: "Full access", sub: "$10/month", tone: "primary" },
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
              <span className="text-center text-[12px] leading-snug text-muted-foreground">
                {step.sub}
              </span>
              {!isLast && <span aria-hidden="true" />}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
