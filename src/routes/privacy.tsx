import { createFileRoute } from "@tanstack/react-router";

import { AppShell, ScreenHeading } from "@/components/AppShell";

const title = "Privacy Policy — WithTwelve";
const description = "How WithTwelve handles your data and privacy.";

export const Route = createFileRoute("/privacy")({
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
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <AppShell>
      <ScreenHeading title="Privacy" />

      <section className="px-6 py-2">
        <div className="bg-surface rounded-2xl p-6 shadow-sm space-y-5">
          <p className="text-[15px] leading-relaxed text-text">
            WithTwelve is designed as a private space for reflection. We encourage you to use it thoughtfully and to share only what you are comfortable sharing.
          </p>

          <p className="text-[15px] leading-relaxed text-text">
            Your account and chat activity are stored so the app can work across sessions, remember your conversations, and keep you safe. We do not use them to train models, and we do not sell them to anyone.
          </p>

          <p className="text-[15px] leading-relaxed text-text">
            Please treat your conversations as personal. If you are ever unsure about what to share, share less.
          </p>

          <p className="text-[13px] leading-relaxed text-muted-foreground">
            A full privacy policy will be published here soon.
          </p>
        </div>
      </section>
    </AppShell>
  );
}
