import { createFileRoute } from "@tanstack/react-router";

import { InfoNote, InfoPage } from "@/components/InfoPage";

const title = "About";
const description = "About WithTwelve and why it exists.";

export const Route = createFileRoute("/about")({
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
  component: AboutPage,
});

function AboutPage() {
  return (
    <InfoPage
      title="About"
      intro="A quiet companion for sincere questions, rooted in scripture."
    >
      <p>
        WithTwelve is a mobile-first Christian reflection app. It is a quiet space to bring sincere
        life questions and receive scripture-rooted responses.
      </p>
      <p>
        When you ask something, the answer comes in the voice of one of the twelve disciples—someone
        who walked with Jesus, struggled, questioned, and grew. The response is not generic advice;
        it is rooted in the Bible and shaped by a disciple’s perspective.
      </p>
      <InfoNote>
        We are not a church, a counsellor, or an emergency service. We are a small companion for
        prayerful thought, designed to help you reflect and find encouragement in scripture.
      </InfoNote>
    </InfoPage>
  );
}
