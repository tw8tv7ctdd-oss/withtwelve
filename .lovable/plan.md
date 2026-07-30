# WithTwelve — Frontend Build Plan (understanding summary first)

No code yet. Below is my read of the binding artifacts, then the frontend I propose.

## 1. Backend constraints

- Existing Supabase project. No new project, no schema/RLS/RPC/migration/Edge Function changes.
- Frontend uses only the Supabase URL + anon key, plus the authenticated user's session.
- No model-provider secrets client-side; no direct LLM calls. All generation goes through the `chat` Edge Function.
- The frontend never writes assistant or crisis/system messages. It only reads, and writes the user-owned rows the schema permits.
- Usage counting, entitlement checks, refunds, disciple routing, and message finalisation are backend-owned.
- Schema v4 wins on data/enforcement; master plan v7 wins on behaviour; `chat/index.ts` wins on the chat contract.

## 2. Core entities and relationships

- `profiles` — one per auth user; holds `subscription_status`, `trial_started_at`, `is_admin`.
- `conversations` — belong to a user; History ordered by `last_message_at`.
- `messages` — belong to a conversation; `role` = user | assistant | system; `status` = streaming | sent | error; flags `is_crisis_flag`, `is_second_view`; assistant rows carry a disciple reference.
- `disciples` — twelve personas with `slug`, `persona_card`, `routing_weight`, `is_active`.
- `daily_prompts` — devotional prompt of the day, used as a chat entry point.
- `usage_daily` — per-user, per-HKT-date question count (backend-written only).
- `scripture_passages`, `history_notes` — retrieval corpora, backend-only.

## 3. Entitlement and daily usage rules

- `profiles.subscription_status` is authoritative: `trial`, `active`, `expired`, `cancelled`.
- Trial = rolling 168 hours from `trial_started_at`; a `trial` status past that window is treated as expired by the backend.
- Trial users: 5 questions per Hong Kong (UTC+8) calendar day; reset at HKT midnight.
- Active users: no daily cap.
- Expired/cancelled: blocked with `subscription_required` (403) — frontend shows an upgrade state, never fabricates access.
- One question = one usage event, including crisis-classified questions.
- "Hear another view" must not consume usage and is stored with `is_second_view = true`.
- Any remaining-question count shown in the UI is an estimate; the backend's `trial_limit_reached` (429) is the truth.

## 4. Chat SSE event contract

Request: `POST` to the `chat` function with `{ conversation_id, text, selected_disciple_id, client_context }` and `Authorization: Bearer <session token>`. Pre-stream failures return plain JSON `{ error: { code, message } }` with status 400/401/403/405/429/500 (`invalid_payload`, `unauthenticated`, `subscription_required`, `trial_limit_reached`, `usage_check_failed`, `profile_missing`).

Once streaming starts, the body is SSE lines of `data: {"event":...,"payload":...}`:

```text
conversation.created        { conversation_id }
message.user.persisted      { user_message_id }
message.assistant.started   { assistant_message_id, disciple ... }
message.assistant.delta     { delta }
message.assistant.completed { assistant_message_id ... }
message.system.completed    { system_message_id }   // crisis path, neutral voice
error                       { code, message }
done                        {}
```

Consumption: `fetch()` + `response.body.getReader()` + `TextDecoder`, buffering and splitting on `\n\n`. No `EventSource` (cannot POST or send auth headers). Pseudo-streaming (a single large delta) must render correctly.

## 5. Proposed frontend architecture

Stack fixed by this project: React 19 + TypeScript on TanStack Start (Vite), Tailwind, shadcn/ui, `@supabase/supabase-js`, lucide-react. Mobile-first, `max-w-md` centered on desktop, using the specified devotional tokens (#F9F7F2 bg, #5A8F8E primary, #C9A96E accent, #3D3632 text, 16/24px radii, shadow-sm only) as semantic CSS variables — no hardcoded colour utilities.

Routes:
- `/` — Today: greeting, daily prompt card, disciple strip, ask entry, trial/usage banner.
- `/chat` and `/chat/$conversationId` — exchange view with composer, disciple picker, streaming bubble.
- `/history` — conversations ordered by `last_message_at`.
- `/disciples`, `/disciples/$slug` — the twelve and their persona cards.
- `/auth` — sign in / sign up against existing Supabase auth.
- `/account` — subscription status, trial countdown, today's usage.

Data layer:
- `src/integrations/supabase/client.ts` (anon key only) plus typed `types.ts` derived from schema v4.
- TanStack Query for all reads (profile, conversations, messages, disciples, daily prompt, usage).
- `useChatStream()` — one hook owning the fetch/reader/decoder loop, mapping each SSE event to local state and cache updates, then reconciling with the database after `done`.
- Auth context around the Supabase session; protected app routes, public auth route.

Behaviour details:
- Optimistic user bubble on send; assistant placeholder on `message.assistant.started`; deltas append.
- Crisis (`message.system.completed`) renders in a distinct neutral, non-disciple style.
- Assistant rows still `streaming` after several minutes render a calm "this reflection didn't finish" state rather than vanishing.
- Error codes map to specific calm UI: upgrade sheet for `subscription_required`, "5 for today, resets at midnight HKT" for `trial_limit_reached`, retry affordance otherwise.
- Disciple precedence mirrored client-side as UI hinting only: explicit pick, else `@mention` in the text, else send `selected_disciple_id: null` and let the backend route.

## Open questions before I build

1. Supabase URL + anon key for the existing project — I need these to wire the client.
2. The uploaded `chat/index.ts` accepts no second-view parameter. Should "Hear another view" be left out of this milestone, or wired to a flag you plan to add backend-side?
3. Is upgrade/checkout in scope now, or should the paywall be informational only?
