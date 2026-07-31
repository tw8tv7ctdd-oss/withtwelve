import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AppShell, ScreenHeading } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, CheckCircle2, Mail, AlertCircle } from "lucide-react";

const title = "Sign in — WithTwelve";
const description = "Sign in to WithTwelve with a secure magic link sent to your email.";

export const Route = createFileRoute("/auth")({
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
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  // Redirect signed-in users away from /auth.
  useEffect(() => {
    if (!loading && session) {
      void navigate({ to: "/home", replace: true });
    }
  }, [session, loading, navigate]);

  // Magic-link detection on this page: if the auth provider later reports a
  // session (e.g. after the user clicks the magic link and lands back here),
  // the effect above will route them onward to /home.

  return (
    <AppShell className="min-h-dvh justify-center">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back home
      </Link>

      <ScreenHeading
        title="Sign in"
        subtitle="We'll email you a secure link — no password to remember."
      />

      <MagicLinkForm />
    </AppShell>
  );
}

function MagicLinkForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || status === "submitting") return;

    setStatus("submitting");
    setError(null);

    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
      },
    });

    if (authError) {
      setStatus("error");
      setError(friendlyError(authError));
      return;
    }

    setStatus("success");
  }

  if (status === "success") {
    return (
      <div
        className="rounded-3xl bg-surface p-6 text-center shadow-sm"
        role="status"
        aria-live="polite"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-base font-medium text-foreground">Check your email</h2>
        <p className="mt-2 text-sm leading-relaxed break-words text-muted-foreground">
          We sent a secure sign-in link to{" "}
          <span className="font-medium text-foreground">{email}</span>. Click it to return here and
          continue.
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-4 min-h-11 text-muted-foreground"
          onClick={() => {
            setStatus("idle");
            setError(null);
            setEmail("");
          }}
        >
          Use a different email
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl bg-surface p-6 shadow-sm">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail
              className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              inputMode="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "submitting"}
              className="h-12 rounded-2xl pl-9"
            />
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            We will never share your email. The link expires in a few minutes.
          </p>
        </div>

        {status === "error" && error && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-start gap-2 rounded-2xl bg-muted/60 p-3 text-sm leading-relaxed text-foreground"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          className="h-12 w-full rounded-2xl"
          disabled={status === "submitting" || !email.trim()}
        >
          {status === "submitting" ? "Sending link…" : "Send magic link"}
        </Button>
      </div>
    </form>
  );
}

function friendlyError(error: { message?: string; code?: string }): string {
  const message = error.message ?? "Something went wrong";

  if (message.toLowerCase().includes("rate limit")) {
    return "We sent too many emails recently. Please wait a moment and try again.";
  }

  if (message.toLowerCase().includes("invalid email")) {
    return "Please check that your email address is correct.";
  }

  return "We couldn't send the link right now. Please try again in a moment.";
}
