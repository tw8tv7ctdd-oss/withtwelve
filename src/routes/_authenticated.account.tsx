import { createFileRoute } from "@tanstack/react-router";

import { AppShell, ScreenHeading } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";

const title = "Account — WithTwelve";
const description = "Your WithTwelve account, plan status, and sign-out.";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, profile, signOut } = useAuth();

  return (
    <AppShell withNav>
      <ScreenHeading title="Account" subtitle="Your details and plan." />

      <dl className="rounded-2xl bg-surface p-6 shadow-sm">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-sm text-muted-foreground">Email</dt>
          <dd className="text-sm">{user?.email ?? "—"}</dd>
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-border pt-4">
          <dt className="text-sm text-muted-foreground">Plan</dt>
          <dd className="text-sm capitalize">{profile?.subscription_status ?? "—"}</dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={() => void signOut()}
        className="mt-6 rounded-2xl border border-border bg-surface px-5 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
      >
        Sign out
      </button>
    </AppShell>
  );
}