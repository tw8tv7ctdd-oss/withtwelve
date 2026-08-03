import { createFileRoute } from "@tanstack/react-router";

import { InfoNote, InfoPage } from "@/components/InfoPage";

const title = "Safety — WithTwelve";
const description = "How WithTwelve handles sensitive moments and care.";

export const Route = createFileRoute("/safeguarding")({
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
    <InfoPage
      title="Safeguarding"
      intro="How WithTwelve handles difficult moments, and where to turn for real-world help."
    >
      <p>
        WithTwelve is designed to be spiritually warm, emotionally safe, and rooted in scripture. It
        is not a replacement for emergency support, medical care, therapy, or crisis intervention.
      </p>
      <p>
        If a question suggests immediate danger, self-harm, or a crisis situation, the app should
        not answer in a disciple voice. Instead, it responds with a neutral safety message that
        encourages you to seek real-world help straight away.
      </p>
      <p>
        If you or someone else may be in immediate danger, please contact local emergency services
        or a trusted person near you now.
      </p>
      <p>
        If you are struggling and need urgent human support, please contact a crisis line, pastor,
        or qualified professional in your country.
      </p>
      <InfoNote>
        WithTwelve can support reflection, prayerful thought, and scripture-based encouragement, but
        it cannot safely handle emergency or crisis care.
      </InfoNote>
    </InfoPage>
  );
}
