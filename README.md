# WithTwelve — frontend

A mobile-first, devotional chat app where a question is answered in the voice of one of the twelve
disciples. This repository contains **the frontend only**. It runs on an existing Supabase backend
(schema, RLS, RPCs and the `chat` Edge Function are owned elsewhere and must not be changed here).

## Stack

- TanStack Start (React 19 + TanStack Router/Query) on Vite
- TypeScript, Tailwind CSS v4, shadcn/ui, lucide-react
- `@supabase/supabase-js` (anon key only)

## Getting started

```sh
npm i
cp .env.example .env   # fill in the project's public Supabase values
npm run dev            # http://localhost:8080
```

### Environment

Only public, client-side values belong here:

| Variable                  | Purpose                            |
| ------------------------- | ---------------------------------- |
| `VITE_SUPABASE_URL`       | Supabase project URL               |
| `VITE_SUPABASE_ANON_KEY`  | Publishable/anon key               |

Never add a service-role key or any model-provider secret to this repo.

## Routes

| Path        | Access    | Purpose                                             |
| ----------- | --------- | --------------------------------------------------- |
| `/`         | public    | Landing page, CTA into `/auth` (or `/home` if signed in) |
| `/auth`     | public    | Magic-link sign-in only                              |
| `/home`     | protected | Greeting, daily prompt, entry points, trial banner   |
| `/history`  | protected | Conversations ordered by `last_message_at`           |
| `/account`  | protected | Entitlement, trial timing, today's usage, sign out   |
| `/chat`     | protected | New reflection                                       |
| `/chat/:id` | protected | Existing conversation                                |

Protected routes live under `src/routes/_authenticated.*` and redirect signed-out visitors to `/auth`.

## Project structure

```
src/
  components/        AppShell, BottomNav, ProtectedRoute, common/States
  components/chat/   ChatScreen, MessageList, MessageBubble, Composer, DisciplePicker
  contexts/          AuthProvider, ChatStreamProvider
  hooks/             useAuth, useChatData, useChatStream
  integrations/supabase/  client.ts, db-types.ts
  lib/               chat-client, chat-contract, entitlements, date-utils, mentions
  routes/            file-based routes (routeTree.gen.ts is generated — never edit)
```

## Backend contract (read-only from the frontend)

- All generation goes through the `chat` Edge Function; the client never calls a model provider.
- The client never writes assistant or crisis/system messages.
- Request body: `{ conversation_id, text, selected_disciple_id, client_context }` with the user's
  bearer token in `Authorization`.
- Pre-stream JSON errors: `invalid_payload`, `unauthenticated`, `subscription_required`,
  `trial_limit_reached`, `usage_check_failed`, `profile_missing`.
- SSE envelopes `{ event, payload }`, consumed with `fetch` + `body.getReader()` (never
  `EventSource`): `conversation.created`, `message.user.persisted`, `message.assistant.started`,
  `message.assistant.delta`, `message.assistant.completed`, `message.system.completed`, `error`,
  `done`.
- Entitlement: `profiles.subscription_status` is authoritative. Trial = rolling 168h, 5 questions
  per HKT day; expired/cancelled cannot start new exchanges.

## Design tokens

Background `#F9F7F2`, surface `#FFFFFF`, primary `#5A8F8E`, accent `#C9A96E`, text `#3D3632`, muted
`#78716C`, border `#E7E5E4`. Radius 16px cards / 24px hero, `shadow-sm` only, Inter, mobile-first
with a centred `max-w-md` column.

## Scripts

```sh
npm run dev      # dev server
npm run build    # production build
npx eslint src   # lint + prettier
```

## Out of scope (intentionally not built)

“Hear another view”, billing/Stripe checkout, standalone disciple pages, any backend mutation
beyond what the Edge Function performs.
