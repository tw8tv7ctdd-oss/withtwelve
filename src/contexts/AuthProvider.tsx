import type { Session, User } from "@supabase/supabase-js";
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/integrations/supabase/db-types";

export interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const profileFor = useRef<string | null>(null);

  useEffect(() => {
    let active = true;

    // Listener is registered before the initial getSession() call so no event is missed.
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const userId = session?.user?.id ?? null;

  useEffect(() => {
    if (!userId) {
      profileFor.current = null;
      setProfile(null);
      return;
    }
    if (profileFor.current === userId) return;
    profileFor.current = userId;

    let active = true;
    // Read-only profile fetch. No mutations happen in this layer.
    void supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setProfile((data as Profile | null) ?? null);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    profileFor.current = null;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user: session?.user ?? null, profile, session, loading, signOut }),
    [session, profile, loading, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}