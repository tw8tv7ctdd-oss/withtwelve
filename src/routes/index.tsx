import { Link, createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/AppShell";
import { HomeFooter } from "@/components/HomeFooter";
import { eyebrowClass, surfaceClass } from "@/components/common/Surface";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, Heart, MessageCircle } from "lucide-react";

const title = "WithTwelve — Walk with the twelve disciples";
const description =
  "A quiet place to bring your questions to Scripture and hear from the disciples who walked with Jesus.";

export const Route = createFileRoute("/")({
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
  component: Landing,
});

function Landing() {
  const { session, loading } = useAuth();

  return (
    <>
    <SiteHeader />
    <AppShell className="justify-between gap-8">
      <div className="flex-1">
        {/* Hero */}
        <div className={`${surfaceClass} text-center`}>
          <p className={eyebrowClass}>WithTwelve</p>
          <h1 className="mt-4 text-[22px] leading-snug font-semibold tracking-tight text-balance">
            Bring your question.
            <br />
            Sit with the twelve.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            A calm space to bring the real questions of your life and receive a Scripture-rooted
            response in the voice of one who walked with Jesus.
          </p>
        </div>

        {/* Simple explanation */}
        <div className="mt-6 space-y-4">
          <Feature
            icon={<MessageCircle className="h-5 w-5" />}
            title="Ask what is on your heart"
            text="Write your question as you would to a friend. Nothing is too ordinary or too heavy."
          />
          <Feature
            icon={<BookOpen className="h-5 w-5" />}
            title="Hear from a disciple"
            text="Your question is answered in the voice of one of the twelve — grounded in the Gospels and the life they lived with Jesus."
          />
          <Feature
            icon={<Heart className="h-5 w-5" />}
            title="Return to the conversation"
            text="Every exchange is saved as a private conversation you can revisit, reflect on, and continue."
          />
        </div>

        {/* Scripture-rooted note */}
        <p className="mt-8 text-center text-xs italic leading-relaxed text-muted-foreground">
          “Come to me, all who are weary and burdened, and I will give you rest.”
          <br />
          <span className="not-italic text-accent">— Matthew 11:28</span>
        </p>
      </div>

      {/* Actions */}
      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="h-12 w-full animate-pulse rounded-2xl bg-muted" aria-hidden="true" />
        ) : (
          <Link
            to={session ? "/home" : "/auth"}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-primary px-5 text-base font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            {session ? "Continue where you left off" : "Begin"}
          </Link>
        )}

        {!loading && session ? (
          <Link
            to="/history"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Or revisit a past conversation
          </Link>
        ) : (
          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            A seven-day trial, then a simple subscription. No noise, no feeds — just Scripture and
            honest conversation.
          </p>
        )}
      </div>
    </AppShell>
    </>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl bg-surface p-5 shadow-sm">
      <div className="mt-0.5 shrink-0 text-accent">{icon}</div>
      <div>
        <h2 className="text-sm font-medium text-foreground">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}
