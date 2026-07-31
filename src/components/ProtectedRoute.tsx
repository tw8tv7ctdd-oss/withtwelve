import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { useAuth } from "@/hooks/useAuth";

/** Redirects to the landing page when there is no Supabase session. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-dvh bg-background" role="status" aria-live="polite">
        <div className="mx-auto w-full max-w-md px-5 pt-[max(2rem,env(safe-area-inset-top))]">
          <div className="h-7 w-1/2 animate-pulse rounded-md bg-muted" />
          <div className="mt-2.5 h-4 w-2/3 animate-pulse rounded-md bg-muted" />
          <div className="mt-6 h-36 animate-pulse rounded-3xl bg-surface" />
          <div className="mt-4 h-20 animate-pulse rounded-3xl bg-surface" />
        </div>
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
