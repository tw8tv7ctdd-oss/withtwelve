import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Add them to the project-root .env file.",
  );
}

const notConfigured = () => ({
  data: null,
  error: { message: "Supabase is not configured", name: "SupabaseNotConfigured" },
});

/**
 * Stand-in used only when the public Vite env vars are absent. It never throws
 * at import time, so the app shell and routes still render; Supabase-backed
 * reads simply resolve to their calm error state.
 */
function createUnconfiguredClient(): SupabaseClient {
  const thenable = () => {
    const builder: Record<string, unknown> = {};
    const chain = new Proxy(builder, {
      get(_t, prop) {
        if (prop === "then") {
          return (resolve: (value: unknown) => unknown) => Promise.resolve(notConfigured()).then(resolve);
        }
        return () => chain;
      },
    });
    return chain;
  };

  const stub = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithOtp: async () => notConfigured(),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
    from: () => thenable(),
    rpc: async () => notConfigured(),
    functions: { invoke: async () => notConfigured() },
  };

  return stub as unknown as SupabaseClient;
}

/** Single browser Supabase client for the whole app. */
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window === "undefined" ? undefined : window.localStorage,
      },
    })
  : createUnconfiguredClient();
