import { createFileRoute } from "@tanstack/react-router";

import { InfoNote, InfoPage } from "@/components/InfoPage";

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
    <InfoPage title="Privacy">
      <p>
        WithTwelve is designed as a private space for reflection. We encourage you to use it
        thoughtfully and to share only what you are comfortable sharing.
      </p>
      <p>
        Your account and chat activity are stored so the app can work across sessions, remember your
        conversations, and keep you safe. We do not use them to train models, and we do not sell
        them to anyone.
      </p>
      <p>
        Please treat your conversations as personal. If you are ever unsure about what to share,
        share less.
      </p>
      <InfoNote>A full privacy policy will be published here soon.</InfoNote>
    </InfoPage>
  );
}
