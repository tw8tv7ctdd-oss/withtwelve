// ---------------------------------------------------------------------------
// TEMPORARY PREVIEW-ONLY AUTH BYPASS — REMOVE LATER
// Delete this file, then remove its imports from:
//   src/contexts/AuthProvider.tsx, src/routes/auth.tsx, src/routes/__root.tsx
// It is inert unless import.meta.env.DEV is true (never in a production build).
// ---------------------------------------------------------------------------
import type { Session, User } from "@supabase/supabase-js";

import type { Profile } from "@/integrations/supabase/db-types";

const STORAGE_KEY = "withtwelve.preview-auth";

/** Dev/preview builds only. Production bundles short-circuit to false. */
export const PREVIEW_AUTH_AVAILABLE = import.meta.env.DEV;

export function isPreviewAuthEnabled(): boolean {
  if (!PREVIEW_AUTH_AVAILABLE || typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

export function setPreviewAuth(enabled: boolean) {
  if (!PREVIEW_AUTH_AVAILABLE || typeof window === "undefined") return;
  if (enabled) window.localStorage.setItem(STORAGE_KEY, "1");
  else window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("withtwelve:preview-auth"));
}

const MOCK_USER = {
  id: "00000000-0000-4000-8000-000000000001",
  aud: "authenticated",
  role: "authenticated",
  email: "preview@withtwelve.local",
  app_metadata: {},
  user_metadata: { preferred_name: "Preview" },
  created_at: new Date(0).toISOString(),
} as unknown as User;

export const previewUser = MOCK_USER;

export const previewSession = {
  access_token: "preview-only-token",
  refresh_token: "preview-only-token",
  token_type: "bearer",
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  user: MOCK_USER,
} as unknown as Session;

export const previewProfile: Profile = {
  id: MOCK_USER.id,
  email: "preview@withtwelve.local",
  preferred_name: "Preview",
  is_admin: false,
  marketing_consent: false,
  consent_timestamp: null,
  trial_started_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  subscription_status: "trial",
  created_at: new Date(0).toISOString(),
  updated_at: new Date(0).toISOString(),
};
