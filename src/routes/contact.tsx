import { Link, createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";

import { InfoNote, InfoPage, infoLinkClass } from "@/components/InfoPage";
import { eyebrowClass } from "@/components/common/Surface";

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
    <InfoPage
      title="Contact WithTwelve"
      intro="If something doesn’t feel right, if you need to report a concern, or if you simply want to get in touch, you can contact us here. We read every message carefully and aim to respond with clarity and care."
    >
      <a
        href="mailto:hello@withtwelve.com"
        className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-foreground shadow-sm transition-colors hover:bg-accent/10"
      >
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Mail size={20} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className={eyebrowClass}>
            Email us
          </p>
          <p className="truncate text-sm font-medium">hello@withtwelve.com</p>
        </div>
      </a>

      <p>
        For safety-related concerns, please also read our{" "}
        <Link to="/safety" className={infoLinkClass}>
          Safety &amp; safeguarding
        </Link>{" "}
        page before sending your message.
      </p>

      <InfoNote>
        We may not be able to reply immediately, but we do not ignore messages sent in good faith.
      </InfoNote>
    </InfoPage>
  );
}
