# Fix: homepage returns a 500 error page

## What's happening

Every route — not just the homepage — returns the fallback "This page didn't load" page. The cause is that the project-root `.env` file is gone from the sandbox. Only `.env.example` (empty placeholders) remains.

Without `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, the Supabase browser client throws while the module is being loaded during server-side rendering, so the server never gets to render any page and falls back to the generic error page.

Confirmed: `curl http://localhost:8080/` returns HTTP 500 with that exact HTML, and `.env` is not present in the repo root.

## Fix

1. Recreate `.env` at the project root with the known public values:
   - `VITE_SUPABASE_URL=https://denztyiqrjhdxetwzdlp.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=sb_publishable_W-L2WtCbGw-JgVBOHw6biw_1gugo7xo`
   These are publishable client-side values; `.gitignore` already excludes `.env`, and `.env.example` stays as placeholders only.
2. Make `src/integrations/supabase/client.ts` fail softly instead of taking the whole app down: when the variables are missing, log the existing warning and skip constructing a client with invalid input, so pages still render and only Supabase-backed reads show their calm error state.
3. Verify by requesting `/` and one authenticated route and confirming HTTP 200 plus the landing page rendering in the preview.

## Notes

No schema, RLS, Edge Function, or product-scope changes. No secrets go into the Secrets panel — these stay public Vite client variables.
