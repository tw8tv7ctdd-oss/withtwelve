import { createFileRoute } from "@tanstack/react-router";

import { AppShell, ScreenHeading } from "@/components/AppShell";

const title = "Contact WithTwelve";
const description = "Get in touch with the WithTwelve team.";

export const Route = createFileRoute("/contact")({
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
  component: ContactPage,
});

function ContactPage() {
  return (
    <AppShell>
      <ScreenHeading
        title="Contact WithTwelve"
        subtitle="If something doesn’t feel right, if you need to report a concern, or if you simply want to get in touch, you can contact us here. We read every message carefully and aim to respond with clarity and care."
      />

      <div className="space-y-6">
        <a
          href="mailto:hello@withtwelve.com"
          className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-foreground shadow-sm transition-colors hover:bg-accent/10"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Email us
            </p>
            <p className="truncate text-sm font-medium">hello@withtwelve.com</p>
          </div>
        </a>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm leading-relaxed text-foreground">
            For safety-related concerns, please also read our{" "}
            <a
              href="/safety"
              className="font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
            >
              Safety &amp; safeguarding
            </a>{" "}
            page before sending your message.
          </p>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          We may not be able to reply immediately, but we do not ignore messages sent in good faith.
        </p>
      </div>
    </AppShell>
  );
}
