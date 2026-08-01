import { createFileRoute } from "@tanstack/react-router";

import { InfoNote, InfoPage } from "@/components/InfoPage";

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
    <InfoPage
      title="Terms"
      intro="The simple agreement between you and WithTwelve while you use this space."
    >
      <p>
        By using WithTwelve, you agree to use it respectfully. Treat others and the space as you
        would want to be treated: honestly, kindly, and without abuse.
      </p>
      <p>
        WithTwelve is provided as a reflection and encouragement tool. We cannot guarantee
        uninterrupted availability, and it is not a substitute for professional care, emergency
        services, or crisis support.
      </p>
      <p>
        If something feels unsafe or urgent, please reach out to someone nearby or a local emergency
        service.
      </p>
      <InfoNote>A full terms of service document will be published here soon.</InfoNote>
    </InfoPage>
  );
}
