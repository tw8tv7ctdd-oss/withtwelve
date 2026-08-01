import { createFileRoute } from "@tanstack/react-router";

import { AppShell, ScreenHeading } from "@/components/AppShell";

const title = "Terms of Service — WithTwelve";
const description = "The terms that govern the use of WithTwelve.";

export const Route = createFileRoute("/terms")({
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
  component: TermsPage,
});

function TermsPage() {
  return (
    <AppShell>
      <ScreenHeading title="Terms" />

      <section className="px-6 py-2">
        <div className="bg-surface rounded-2xl p-6 shadow-sm space-y-5">
          <p className="text-[15px] leading-relaxed text-text">
            By using WithTwelve, you agree to use it respectfully. Treat others and the space as you would want to be treated: honestly, kindly, and without abuse.
          </p>

          <p className="text-[15px] leading-relaxed text-text">
            WithTwelve is provided as a reflection and encouragement tool. We cannot guarantee uninterrupted availability, and it is not a substitute for professional care, emergency services, or crisis support.
          </p>

          <p className="text-[15px] leading-relaxed text-text">
            If something feels unsafe or urgent, please reach out to someone nearby or a local emergency service.
          </p>

          <p className="text-[13px] leading-relaxed text-muted-foreground">
            A full terms of service document will be published here soon.
          </p>
        </div>
      </section>
    </AppShell>
  );
}
