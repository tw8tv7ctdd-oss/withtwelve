import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

type ChatRequest = {
  conversation_id: string | null
  text: string
  selected_disciple_id: string | null
  client_context?: {
    source?: "chat_input" | "starter_prompt" | "daily_prompt"
    locale?: string
    app_version?: string
  } | null
}

type ClassificationResult = {
  classification: "normal" | "politics" | "crisis" | "off_topic"
  seriousness: "light" | "serious"
  retrieval_topics: string[]
  routing_hint: string | null
}

type DiscipleRow = {
  id: string
  name: string
  slug: string
  persona_card: Record<string, unknown> | null
  routing_weight: number
  is_active: boolean
}

type ScriptureRow = {
  id: string
  translation: "kjv" | "web"
  book: string
  chapter: number
  verse_start: number
  verse_end: number | null
  text: string
}

type HistoryRow = {
  id: string
  note_type: string | null
  category: string | null
  era: string | null
  location: string | null
  text: string
}

type ChatMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

const FOUNDRY_BASE_URL = Deno.env.get("FOUNDRY_BASE_URL")!
const FOUNDRY_API_KEY = Deno.env.get("FOUNDRY_API_KEY")!
const FOUNDRY_CHAT_MODEL = Deno.env.get("FOUNDRY_CHAT_MODEL")!
const FOUNDRY_MINI_MODEL = Deno.env.get("FOUNDRY_MINI_MODEL")!
const FOUNDRY_EMBEDDING_MODEL = Deno.env.get("FOUNDRY_EMBEDDING_MODEL")!

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const CRISIS_RESPONSE_TEXT = `It sounds like you may be going through something very serious right now.
Please reach out to someone who can help.

If you are in Hong Kong: Samaritans of Hong Kong — 2382 0000 (24 hours)
If you are in the UK: Samaritans — 116 123 (free, 24 hours)
If you are in the US: 988 Suicide & Crisis Lifeline — call or text 988

Please talk to someone. You matter.`

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  })
}

function nonStreamedError(code: string, message: string, status: number) {
  return jsonResponse({ error: { code, message } }, status)
}

function getHktDateStr() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Hong_Kong",
  }).format(new Date())
}

function emitSse(
  controller: ReadableStreamDefaultController<Uint8Array>,
  event: string,
  payload: Record<string, unknown>,
) {
  const chunk = `data: ${JSON.stringify({ event, payload })}\n\n`
  controller.enqueue(new TextEncoder().encode(chunk))
}

function parseMention(text: string): string | null {
  const match = text.match(/@([a-z0-9-]+)/i)
  return match?.[1]?.toLowerCase() ?? null
}

function weightedPick<T extends { routing_weight: number }>(rows: T[]): T {
  const total = rows.reduce((sum, row) => sum + Number(row.routing_weight || 0), 0)

  if (total <= 0) {
    return rows[Math.floor(Math.random() * rows.length)]
  }

  const r = Math.random() * total
  let cursor = 0
  for (const row of rows) {
    cursor += Number(row.routing_weight || 0)
    if (r <= cursor) return row
  }
  return rows[rows.length - 1]
}

function scriptureReference(row: ScriptureRow) {
  return `${row.book} ${row.chapter}:${row.verse_start}${row.verse_end && row.verse_end !== row.verse_start ? "–" + row.verse_end : ""}`
}

function scripturePromptLine(row: ScriptureRow) {
  return `${scriptureReference(row)} (${row.translation.toUpperCase()}): "${row.text}"`
}

function historyPromptLine(row: HistoryRow) {
  return `[${row.category ?? row.note_type ?? "context"}${row.era ? ", " + row.era : ""}] ${row.text}`
}

function normalizePersona(personaCard: Record<string, unknown> | null) {
  const card = personaCard ?? {}
  return {
    identity_summary: typeof card.identity_summary === "string" ? card.identity_summary : "",
    voice_traits: Array.isArray(card.voice_traits) ? card.voice_traits.map(String) : [],
    humor_style: typeof card.humor_style === "string" ? card.humor_style : "",
    serious_mode: typeof card.serious_mode === "string" ? card.serious_mode : "",
    best_topics: Array.isArray(card.best_topics) ? card.best_topics.map(String) : [],
    guardrails: Array.isArray(card.guardrails) ? card.guardrails.map(String) : [],
  }
}

async function safeAppEvent(
  supabaseAdmin: ReturnType<typeof createClient>,
  userId: string,
  eventType: string,
  metadata: Record<string, unknown> = {},
) {
  void supabaseAdmin
    .from("app_events")
    .insert({
      user_id: userId,
      event_type: eventType,
      metadata,
    })
    .catch(() => {})
}

async function refundUsageIfNeeded(
  supabaseAdmin: ReturnType<typeof createClient>,
  shouldRefund: boolean,
  userId: string,
  hktDateStr: string | null,
) {
  if (!shouldRefund || !hktDateStr) return
  await supabaseAdmin.rpc("decrement_usage_safe", {
    p_user_id: userId,
    p_date: hktDateStr,
  }).then(() => {}).catch(() => {})
}

const FOUNDRY_V1_BASE = FOUNDRY_BASE_URL.replace(/\/+$/, "")

function foundryHeaders() {
  return {
    "Content-Type": "application/json",
    "api-key": FOUNDRY_API_KEY,
  }
}

async function foundryResponsesCreate(args: {
  model: string
  input: string | Array<Record<string, unknown>>
  instructions?: string
  max_output_tokens?: number
  temperature?: number
  text?: Record<string, unknown>
}) {
  const res = await fetch(`${FOUNDRY_V1_BASE}/responses`, {
    method: "POST",
    headers: foundryHeaders(),
    body: JSON.stringify({
      model: args.model,
      input: args.input,
      instructions: args.instructions,
      max_output_tokens: args.max_output_tokens ?? 400,
      temperature: args.temperature ?? 0.7,
      text: args.text,
      stream: false,
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    console.error("foundry_responses_http_error", {
      status: res.status,
      body,
      model: args.model,
    })
    throw new Error(`foundry_responses_failed_${res.status}`)
  }

  return await res.json()
}

async function foundryResponsesStream(args: {
  model: string
  input: string | Array<Record<string, unknown>>
  instructions?: string
  max_output_tokens?: number
  temperature?: number
}) {
  const json = await foundryResponsesCreate({
    model: args.model,
    input: args.input,
    instructions: args.instructions,
    max_output_tokens: args.max_output_tokens ?? 400,
    temperature: args.temperature ?? 0.7,
  })

  const text = await retrieveResponseOutputText(json)

  if (!text.trim()) {
    throw new Error("empty_model_output")
  }

  const encoder = new TextEncoder()
  const sse = `data: ${JSON.stringify({
    type: "response.output_text.delta",
    delta: text,
  })}\n\n`

  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(sse))
      controller.close()
    },
  })
}

async function foundryEmbedding(input: string): Promise<number[]> {
  const res = await fetch(`${FOUNDRY_V1_BASE}/embeddings`, {
    method: "POST",
    headers: foundryHeaders(),
    body: JSON.stringify({
      model: FOUNDRY_EMBEDDING_MODEL,
      input,
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    console.error("foundry_embedding_http_error", {
      status: res.status,
      body,
    })
    throw new Error(`foundry_embedding_failed_${res.status}`)
  }

  const json = await res.json()
  return json.data?.[0]?.embedding ?? []
}

async function retrieveResponseOutputText(json: Record<string, unknown>): Promise<string> {
  const outputText = json.output_text
  if (typeof outputText === "string" && outputText) return outputText

  const output = Array.isArray(json.output) ? json.output : []
  const parts: string[] = []

  for (const item of output) {
    const content = Array.isArray((item as Record<string, unknown>).content)
      ? (item as Record<string, unknown>).content as Array<Record<string, unknown>>
      : []
    for (const block of content) {
      if (typeof block.text === "string") parts.push(block.text)
    }
  }

  return parts.join("").trim()
}

async function retrieveFoundryStreamDeltas(
  streamBody: ReadableStream<Uint8Array>,
  onDelta: (delta: string) => void,
) {
  const reader = streamBody.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { value, done } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const parts = buffer.split("\n\n")
    buffer = parts.pop() ?? ""

    for (const part of parts) {
      const lines = part.split("\n").filter((line) => line.startsWith("data: "))
      for (const line of lines) {
        const data = line.slice(6).trim()
        if (!data || data === "[DONE]") continue

        let parsed: Record<string, unknown>
        try {
          parsed = JSON.parse(data)
        } catch {
          continue
        }

        const type = typeof parsed.type === "string" ? parsed.type : ""
        if (type === "response.output_text.delta") {
          const delta = typeof parsed.delta === "string" ? parsed.delta : ""
          if (delta) onDelta(delta)
          continue
        }

        const delta = typeof parsed.delta === "string" ? parsed.delta : ""
        if (delta) onDelta(delta)
      }
    }
  }
}

function buildResponseInput(priorMessages: ChatMessage[], userText: string) {
  const input = priorMessages.map((m) => ({
    role: m.role,
    content: [{ type: "input_text", text: m.content }],
  }))

  input.push({
    role: "user",
    content: [{ type: "input_text", text: userText }],
  })

  return input
}

async function classifyQuestion(text: string): Promise<ClassificationResult> {
  const fallback: ClassificationResult = {
    classification: "normal",
    seriousness: "serious",
    retrieval_topics: [],
    routing_hint: null,
  }

  try {
    const response = await foundryResponsesCreate({
      model: FOUNDRY_MINI_MODEL,
      temperature: 0,
      max_output_tokens: 200,
      instructions: `You are a classifier for a Christian reflection app. Classify the user's question.

classification:
- "crisis": self-harm, suicide, imminent danger, abuse emergency, urgent safety concern
- "politics": voting, political parties, partisan policy, electoral issues
- "off_topic": entirely unrelated to faith, scripture, spiritual life, or character
- "normal": everything else including doubt, grief, theology, relationships, prayer

seriousness:
- "light": casual, curious, simple
- "serious": grief, guilt, crisis-adjacent, deep theological struggle

retrieval_topics: 2–4 short strings useful for retrieval
routing_hint: a disciple slug if the question strongly suits one disciple, otherwise null

Return only valid JSON matching the schema. No explanation.`,
      input: text,
      text: {
        format: {
          type: "json_schema",
          name: "classification_result",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              classification: {
                type: "string",
                enum: ["normal", "politics", "crisis", "off_topic"],
              },
              seriousness: {
                type: "string",
                enum: ["light", "serious"],
              },
              retrieval_topics: {
                type: "array",
                items: { type: "string" },
              },
              routing_hint: {
                anyOf: [{ type: "string" }, { type: "null" }],
              },
            },
            required: ["classification", "seriousness", "retrieval_topics", "routing_hint"],
          },
        },
      },
    })

    const content = await retrieveResponseOutputText(response)
    const parsed = JSON.parse(content)

    return {
      classification: ["normal", "politics", "crisis", "off_topic"].includes(parsed.classification)
        ? parsed.classification
        : "normal",
      seriousness: ["light", "serious"].includes(parsed.seriousness)
        ? parsed.seriousness
        : "serious",
      retrieval_topics: Array.isArray(parsed.retrieval_topics)
        ? parsed.retrieval_topics.map(String).slice(0, 4)
        : [],
      routing_hint: typeof parsed.routing_hint === "string" && parsed.routing_hint.trim()
        ? parsed.routing_hint.trim().toLowerCase()
        : null,
    }
  } catch {
    return fallback
  }
}

async function getDiscipleByIdOrSlug(
  supabaseAdmin: ReturnType<typeof createClient>,
  mode: "id" | "slug",
  value: string,
): Promise<DiscipleRow | null> {
  let query = supabaseAdmin
    .from("disciples")
    .select("id, name, slug, persona_card, routing_weight, is_active")
    .eq("is_active", true)

  query = mode === "id" ? query.eq("id", value) : query.eq("slug", value)

  const { data } = await query.maybeSingle()
  return (data as DiscipleRow | null) ?? null
}

async function retrieveScripture(
  supabaseAdmin: ReturnType<typeof createClient>,
  queryEmbedding: number[],
): Promise<{ formatted: string[]; raw: ScriptureRow[] }> {
  const { data: kjvResults } = await supabaseAdmin.rpc("match_scripture", {
    query_embedding: queryEmbedding,
    translation_filter: "kjv",
    match_count: 5,
  })

  const kjvRows = (kjvResults ?? []) as ScriptureRow[]
  let merged = [...kjvRows]

  if (kjvRows.length < 3) {
    const { data: webResults } = await supabaseAdmin.rpc("match_scripture", {
      query_embedding: queryEmbedding,
      translation_filter: "web",
      match_count: 3,
    })

    const seen = new Set(
      kjvRows.map((r) => `${r.book}|${r.chapter}|${r.verse_start}|${r.verse_end ?? r.verse_start}`),
    )

    const dedupedWeb = ((webResults ?? []) as ScriptureRow[]).filter((r) => {
      const key = `${r.book}|${r.chapter}|${r.verse_start}|${r.verse_end ?? r.verse_start}`
      return !seen.has(key)
    })

    merged = [...kjvRows, ...dedupedWeb].slice(0, 6)
  }

  return {
    raw: merged,
    formatted: merged.map(scripturePromptLine),
  }
}

async function retrieveHistory(
  supabaseAdmin: ReturnType<typeof createClient>,
  queryEmbedding: number[],
): Promise<{ formatted: string[]; raw: HistoryRow[] }> {
  const { data } = await supabaseAdmin.rpc("match_history_notes", {
    query_embedding: queryEmbedding,
    match_count: 4,
  })

  const rows = (data ?? []) as HistoryRow[]
  return {
    raw: rows,
    formatted: rows.map(historyPromptLine),
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return nonStreamedError("method_not_allowed", "Method not allowed.", 405)
  }

  const authHeader = req.headers.get("Authorization")
  if (!authHeader) {
    return nonStreamedError("unauthenticated", "Authentication required.", 401)
  }

  const supabaseUser = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: authHeader } } },
  )

  const supabaseAdmin = createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
  )

  let requestBody: ChatRequest
  try {
    requestBody = await req.json()
  } catch {
    return nonStreamedError("invalid_payload", "Invalid request body.", 400)
  }

  const text = typeof requestBody.text === "string" ? requestBody.text.trim() : ""
  if (!text || text.length > 2000) {
    return nonStreamedError("invalid_payload", "Question must be between 1 and 2000 characters.", 400)
  }

  const { data: authData, error: authError } = await supabaseUser.auth.getUser()
  const user = authData?.user
  if (authError || !user) {
    return nonStreamedError("unauthenticated", "Authentication required.", 401)
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, subscription_status, trial_started_at")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    return nonStreamedError("profile_missing", "Profile could not be loaded.", 500)
  }

  const trialStartedAt = profile.trial_started_at ? new Date(profile.trial_started_at) : null
  const trialStillValid = !!trialStartedAt && (Date.now() - trialStartedAt.getTime()) < 7 * 24 * 60 * 60 * 1000

  let entitlement: "active" | "in_trial" | "expired" | "cancelled" = "expired"

  if (profile.subscription_status === "active") {
    entitlement = "active"
  } else if (profile.subscription_status === "trial" && trialStillValid) {
    entitlement = "in_trial"
  } else if (profile.subscription_status === "cancelled") {
    entitlement = "cancelled"
  } else {
    entitlement = "expired"
  }

  if (entitlement !== "active" && entitlement !== "in_trial") {
    await safeAppEvent(supabaseAdmin, user.id, "question_rejected_subscription", {})
    return nonStreamedError("subscription_required", "Your trial has ended. Upgrade to continue.", 403)
  }

  let usageIncremented = false
  let hktDateStr: string | null = null

  if (entitlement === "in_trial") {
    hktDateStr = getHktDateStr()

    const { data: newCount, error: usageError } = await supabaseAdmin.rpc("increment_usage_and_check", {
      p_user_id: user.id,
      p_date: hktDateStr,
      p_limit: 5,
    })

    if (usageError) {
      return nonStreamedError("usage_check_failed", "Could not verify daily usage. Please try again.", 500)
    }

    if (typeof newCount === "number" && newCount > 5) {
      await refundUsageIfNeeded(supabaseAdmin, true, user.id, hktDateStr)
      await safeAppEvent(supabaseAdmin, user.id, "question_rejected_trial_limit", {})
      return nonStreamedError(
        "trial_limit_reached",
        "You have used all 5 questions for today. Questions reset at midnight Hong Kong time.",
        429,
      )
    }

    usageIncremented = true
  }

  const stream = new ReadableStream<Uint8Array>({
    start: async (controller) => {
      let assistantMessageId: string | null = null
      let selectedDiscipleForFailure: DiscipleRow | null = null
      let conversationIdForFailure: string | null = requestBody.conversation_id
      let streamingStarted = false

      const fail = async (code: string, message: string, markAssistantError = true) => {
        if (!streamingStarted) {
          await refundUsageIfNeeded(supabaseAdmin, usageIncremented, user.id, hktDateStr)
        }

        if (markAssistantError && assistantMessageId) {
          await supabaseAdmin
            .from("messages")
            .update({ status: "error" })
            .eq("id", assistantMessageId)
        }

        await safeAppEvent(supabaseAdmin, user.id, "response_failed", {
          code,
          conversation_id: conversationIdForFailure,
          disciple_id: selectedDiscipleForFailure?.id ?? null,
        })

        emitSse(controller, "error", { code, message })
        emitSse(controller, "done", {})
        controller.close()
      }

      let timeoutId: number | undefined

      try {
        const timeoutMs = 90000
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error("timeout")), timeoutMs)
        })

        const result = await Promise.race([
          (async () => {
            let conversationId = requestBody.conversation_id

            if (conversationId) {
              const { data: conversation } = await supabaseAdmin
                .from("conversations")
                .select("id, user_id")
                .eq("id", conversationId)
                .maybeSingle()

              if (!conversation || conversation.user_id !== user.id) {
                throw new Error("conversation_forbidden")
              }
            } else {
              const { data: newConversation, error: conversationError } = await supabaseAdmin
                .from("conversations")
                .insert({ user_id: user.id })
                .select("id")
                .single()

              if (conversationError || !newConversation) {
                throw new Error("conversation_create_failed")
              }

              conversationId = newConversation.id
              emitSse(controller, "conversation.created", { conversation_id: conversationId })
            }

            conversationIdForFailure = conversationId

            const { data: userMsg, error: userMessageError } = await supabaseAdmin
              .from("messages")
              .insert({
                conversation_id: conversationId,
                user_id: user.id,
                role: "user",
                content: text,
                status: "sent",
              })
              .select("id")
              .single()

            if (userMessageError || !userMsg) {
              throw new Error("user_message_persist_failed")
            }

            emitSse(controller, "message.user.persisted", { user_message_id: userMsg.id })

            await safeAppEvent(supabaseAdmin, user.id, "question_submitted", {
              conversation_id: conversationId,
              source: requestBody.client_context?.source ?? "chat_input",
            })

            let selectedDisciple: DiscipleRow | null = null
            let selectionSource: "explicit" | "mention" | "routing_hint" | "auto" = "auto"

            if (requestBody.selected_disciple_id) {
              selectedDisciple = await getDiscipleByIdOrSlug(supabaseAdmin, "id", requestBody.selected_disciple_id)
              if (selectedDisciple) selectionSource = "explicit"
            }

            if (!selectedDisciple) {
              const mentionSlug = parseMention(text)
              if (mentionSlug) {
                selectedDisciple = await getDiscipleByIdOrSlug(supabaseAdmin, "slug", mentionSlug)
                if (selectedDisciple) selectionSource = "mention"
              }
            }

            const classification = await classifyQuestion(text)

            if (classification.classification === "crisis") {
              const { data: crisisMsg, error: crisisError } = await supabaseAdmin
                .from("messages")
                .insert({
                  conversation_id: conversationId,
                  user_id: user.id,
                  role: "system",
                  content: CRISIS_RESPONSE_TEXT,
                  status: "sent",
                  is_crisis_flag: true,
                })
                .select("id")
                .single()

              if (crisisError || !crisisMsg) {
                throw new Error("crisis_persist_failed")
              }

              await supabaseAdmin.from("reports").insert({
                user_id: user.id,
                message_id: userMsg.id,
                reason: "crisis_auto_detected",
                is_crisis: true,
              })

              await supabaseAdmin
                .from("conversations")
                .update({ last_message_at: new Date().toISOString() })
                .eq("id", conversationId)

              await safeAppEvent(supabaseAdmin, user.id, "crisis_intercepted", {
                conversation_id: conversationId,
              })

              emitSse(controller, "message.system.completed", { system_message_id: crisisMsg.id })
              emitSse(controller, "done", {})
              controller.close()
              return
            }

            if (!selectedDisciple && classification.routing_hint) {
              selectedDisciple = await getDiscipleByIdOrSlug(supabaseAdmin, "slug", classification.routing_hint)
              if (selectedDisciple) selectionSource = "routing_hint"
            }

            if (!selectedDisciple) {
              const { data: activeDisciples, error: disciplesError } = await supabaseAdmin
                .from("disciples")
                .select("id, name, slug, persona_card, routing_weight, is_active")
                .eq("is_active", true)

              if (disciplesError || !activeDisciples || activeDisciples.length === 0) {
                throw new Error("no_active_disciples")
              }

              selectedDisciple = weightedPick(activeDisciples as DiscipleRow[])
              selectionSource = "auto"
            }

            selectedDiscipleForFailure = selectedDisciple

            await safeAppEvent(supabaseAdmin, user.id, "disciple_selected", {
              disciple_id: selectedDisciple.id,
              disciple_slug: selectedDisciple.slug,
              selection_source: selectionSource,
            })

            const queryEmbedding = await foundryEmbedding(text)
            if (!queryEmbedding || queryEmbedding.length === 0) {
              throw new Error("embedding_failed")
            }

            const scripture = await retrieveScripture(supabaseAdmin, queryEmbedding)
            const history = await retrieveHistory(supabaseAdmin, queryEmbedding)
            const persona = normalizePersona(selectedDisciple.persona_card)
            const primaryReference = scripture.raw[0]
              ? scriptureReference(scripture.raw[0])
              : null

            const { data: recentMessages } = await supabaseAdmin
              .from("messages")
              .select("role, content, disciple_id, status, created_at")
              .eq("conversation_id", conversationId)
              .neq("id", userMsg.id)
              .eq("status", "sent")
              .order("created_at", { ascending: false })
              .limit(6)

            const priorMessages = (recentMessages ?? []).reverse().flatMap((m: { role: string; content: string | null }) => {
              if (!m.content) return []

              const role =
                m.role === "assistant"
                  ? "assistant"
                  : m.role === "system"
                  ? "system"
                  : "user"

              return [{ role, content: m.content as string }]
            }) as ChatMessage[]

            const instructions = `You are ${selectedDisciple.name}, one of the Twelve disciples of Jesus.

Identity: ${persona.identity_summary}
Voice: ${persona.voice_traits.join(", ")}
Mode: ${classification.seriousness === "serious" ? persona.serious_mode : persona.humor_style}
Guardrails: ${persona.guardrails.join(". ")}

Classification: ${classification.classification} | Seriousness: ${classification.seriousness}

Scripture (KJV preferred):
${scripture.formatted.join("\n")}

Historical context:
${history.formatted.join("\n")}

Rules:
- Respond in first person as ${selectedDisciple.name}.
- Ground your response in the scripture above.
- Historical context supports your answer; do not speculate beyond it.
- Do not claim divine authority, guarantee outcomes, or override scripture.
- If the question is political, respond with conscience, wisdom, and neighbor-love. Do not suggest a vote.
- Keep your response to 2–4 sentences unless depth is genuinely required.
- You may include one verse reference at the end as "Based on [reference]" only if it is central and you are confident.
- Do not impersonate a therapist, doctor, lawyer, or crisis counselor.`

            const { data: assistantMsg, error: assistantInsertError } = await supabaseAdmin
              .from("messages")
              .insert({
                conversation_id: conversationId,
                user_id: user.id,
                role: "assistant",
                disciple_id: selectedDisciple.id,
                content: null,
                status: "streaming",
              })
              .select("id")
              .single()

            if (assistantInsertError || !assistantMsg) {
              throw new Error("assistant_placeholder_failed")
            }

            assistantMessageId = assistantMsg.id

            emitSse(controller, "message.assistant.started", {
              assistant_message_id: assistantMessageId,
              disciple_id: selectedDisciple.id,
              disciple_name: selectedDisciple.name,
              scripture_reference: primaryReference,
              display_title: primaryReference
                ? `${selectedDisciple.name} · Based on ${primaryReference}`
                : selectedDisciple.name,
            })

            await safeAppEvent(supabaseAdmin, user.id, "response_stream_started", {
              conversation_id: conversationId,
              disciple_id: selectedDisciple.id,
            })

            const streamBody = await foundryResponsesStream({
              model: FOUNDRY_CHAT_MODEL,
              instructions,
              input: buildResponseInput(priorMessages, text),
              max_output_tokens: 400,
              temperature: 0.7,
            })

            let fullContent = ""

            await retrieveFoundryStreamDeltas(streamBody, (delta) => {
              fullContent += delta
              emitSse(controller, "message.assistant.delta", { delta })
              streamingStarted = true
            })

            if (!fullContent.trim()) {
              throw new Error("empty_model_output")
            }

            const { error: updateError } = await supabaseAdmin
              .from("messages")
              .update({
                content: fullContent,
                status: "sent",
                metadata: {
                  scripture_refs: scripture.raw.map((r) => scriptureReference(r)),
                  primary_scripture_ref: primaryReference,
                  history_note_ids: history.raw.map((h) => h.id),
                  routing_seriousness: classification.seriousness,
                  routing_classification: classification.classification,
                  retrieval_topics: classification.retrieval_topics,
                  selection_source: selectionSource,
                },
              })
              .eq("id", assistantMessageId)

            if (updateError) {
              await supabaseAdmin
                .from("messages")
                .update({ status: "error" })
                .eq("id", assistantMessageId)

              await safeAppEvent(supabaseAdmin, user.id, "response_failed", {
                code: "persistence_failed",
                conversation_id: conversationId,
                disciple_id: selectedDisciple.id,
              })

              emitSse(controller, "error", {
                code: "persistence_failed",
                message: "Response could not be saved. Please try again.",
              })
              emitSse(controller, "done", {})
              controller.close()
              return
            }

            await supabaseAdmin
              .from("conversations")
              .update({ last_message_at: new Date().toISOString() })
              .eq("id", conversationId)

            await safeAppEvent(supabaseAdmin, user.id, "response_completed", {
              conversation_id: conversationId,
              disciple_id: selectedDisciple.id,
            })

            emitSse(controller, "message.assistant.completed", {
              assistant_message_id: assistantMessageId,
              disciple_id: selectedDisciple.id,
            })
            emitSse(controller, "done", {})
            controller.close()
          })(),
          timeoutPromise,
        ])

        return result
      } catch (error) {
        console.error("chat_generation_error", {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : null,
          conversation_id: conversationIdForFailure,
          disciple_id: selectedDiscipleForFailure?.id ?? null,
          streamingStarted,
        })

        const isTimeout = error instanceof Error && error.message === "timeout"
        return await fail(
          isTimeout ? "timeout" : "generation_failed",
          isTimeout
            ? "The Twelve are reflecting deeply right now. Please check your connection and try again."
            : "The Twelve are reflecting deeply right now. Please try again.",
        )
      } finally {
        if (timeoutId !== undefined) {
          clearTimeout(timeoutId)
        }
      }
    },
  })

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  })
})