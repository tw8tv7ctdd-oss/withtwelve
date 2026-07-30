import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { useAuth } from "@/hooks/useAuth";

/** Redirects to the landing page when there is no Supabase session. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="h-8 w-8 animate-pulse rounded-full bg-primary/20" />
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}