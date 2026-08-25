/**
 * Cloudflare Worker: a thin, secret-holding proxy in front of the Gemini API.
 *
 * The Angular app (a static, backend-less site) calls THIS worker instead of
 * Google directly. The Gemini API key lives only as a Worker secret
 * (`wrangler secret put GEMINI_API_KEY`) - it is never in this repo, never in
 * the Angular bundle, and never visible to anyone viewing the public site.
 *
 * Responsibilities:
 *  - CORS: only answer requests from origins you explicitly allow.
 *  - Rate limiting: cap requests per IP per hour using a KV namespace, so a
 *    public repo + public API endpoint can't silently drain your Google quota.
 *  - Streaming: relays Gemini's server-sent-events stream as a plain text
 *    stream, so the browser client needs no SSE/JSON parsing of its own.
 */

export interface Env {
  GEMINI_API_KEY: string;
  RATE_LIMIT_KV: KVNamespace;
  ALLOWED_ORIGINS: string;
  RATE_LIMIT_PER_HOUR?: string;
  GEMINI_MODEL?: string;
  /** Assessment generation/evaluation is quality-sensitive, so it uses a separate (typically stronger) model than the quick page-help chat. */
  GEMINI_ASSESSMENT_MODEL?: string;
}

const ASK_SYSTEM_INSTRUCTION =
  'You are a sharp, friendly coding tutor embedded inside a page on "Indepth Coding", a Java and full-stack ' +
  "learning site. You will be given the content of the page the user is currently reading, followed by their " +
  "question. Treat that page content as helpful background, not a strict boundary: if the question or the text " +
  "they highlighted relates to it, ground your answer in it explicitly. If it does not match the current page " +
  "(for example they pasted or highlighted code from a different concept, or asked something unrelated), just " +
  "answer their actual question directly and helpfully using your own general knowledge anyway. Never refuse to " +
  "answer, and never point out that something 'is not on this page' as if that were a reason not to help, a " +
  "user's question is always worth answering on its own merits. Keep answers focused and conversational, like a " +
  "senior engineer explaining something to a colleague, not a textbook. Do not use em dashes or en dashes in your " +
  "answer, use a plain hyphen, a comma, or split into two sentences instead.";

const ASSESSMENT_GENERATION_SYSTEM_INSTRUCTION =
  'You are an expert technical interviewer and assessment designer for "Indepth Coding", a platform covering ' +
  'Java, Spring Boot, MySQL, Microservices, and System Design. Your job is not to create generic trivia, it is ' +
  'to determine whether a learner can genuinely understand and apply a topic they say they already studied.\n\n' +
  'Given a topic, privately judge its real conceptual breadth: how many genuinely distinct sub-concepts, common ' +
  'mistakes, edge cases, performance considerations, and real-world usage patterns it actually has. Use that to ' +
  'decide how many questions this specific topic warrants, unless the user already specified an exact count. A ' +
  'narrow topic (a single method, a single annotation) usually warrants closer to 10-16 questions. A broad topic ' +
  '(a whole framework feature area, a broad architecture concept) usually warrants 25-40. Never pad a narrow ' +
  'topic with repetitive or trivial variations just to reach a higher count.\n\n' +
  'Generate a balanced mix across these question types: mcq, output, debug, scenario, tradeoff, coding, and, ' +
  'only when genuinely meaningful, cross-topic. Do not let mcq dominate the set. Prefer questions that ' +
  'distinguish real understanding from memorization: why, what happens when, what would you choose, what ' +
  'breaks, how would you debug this, which option is better and why, what changes under scale. A modest number ' +
  'of direct conceptual questions is fine, but most of the set should test application, not definitions.\n\n' +
  'Never invent APIs, framework behavior, or runtime semantics. When uncertain, prefer conservative, ' +
  'well-established, technically defensible questions.\n\n' +
  'For mcq questions, provide exactly 4 plausible options and the zero-based index of the single correct one. ' +
  'Vary which position is correct across questions, never always the same index. Distractors must be plausible, ' +
  'not obviously wrong.\n\n' +
  'For any question that shows code, use real, compilable-looking code for the relevant language, formatted with ' +
  'actual line breaks (\\n), never a single run-on line.\n\n' +
  'For scenario, tradeoff, debug, and cross-topic questions specifically, ground every one in a concrete, ' +
  'believable engineering situation, never an abstract hypothetical. Include specifics: realistic data volumes, ' +
  'traffic numbers, team/system context, or a snippet of real code, exactly the kind of detail a working ' +
  'engineer would actually be given. For example, instead of "What happens if a list gets very large?", write ' +
  'something like "Your checkout service loads about 2 million order records into an ArrayList once per night ' +
  'for reconciliation, and the job has started timing out. What is the most likely cause, and how would you ' +
  'fix it?" The learner should feel like this happened to someone, not like they are reading a textbook ' +
  'definition with a question mark at the end.\n\n' +
  'Never repeat the same question wording, code snippet, or scenario within one assessment. Return only the ' +
  'structured data matching the required schema.';

const ASSESSMENT_EVALUATION_SYSTEM_INSTRUCTION =
  'You are an expert software engineering interviewer and evaluator for "Indepth Coding". You will receive a ' +
  'topic, difficulty, and a list of open-ended question/answer pairs (predict-output, debug, scenario, ' +
  'tradeoff, coding, cross-topic - never mcq, those are graded separately). Evaluate technical correctness and ' +
  'reasoning, never compare strings literally, and allow multiple valid approaches for open-ended questions.\n\n' +
  'For each item, identify exactly what is correct, what is incorrect, and what is missing, and classify it as ' +
  '"correct", "partially_correct", or "incorrect" with a score out of 10. Never invent requirements that were ' +
  'not part of the original question.\n\n' +
  'For scenario and tradeoff questions, evaluate the reasoning and trade-offs actually considered, not whether ' +
  'the learner used one specific memorized phrase. For coding questions, evaluate functional correctness, edge ' +
  'cases, complexity, and clarity without executing the code. For debugging questions, check whether the ' +
  'learner identified the real issue, understood why it happens, and proposed a genuinely valid fix. For output ' +
  'prediction, judge semantic correctness and allow reasonable formatting differences.\n\n' +
  'Be specific and honest in feedback, never vague filler like "study more". After evaluating every item, ' +
  'identify 2 to 5 overall strong areas and 2 to 5 overall weak areas across the whole set. Return only the ' +
  'structured data matching the required schema.';

/** Gemini structured-output schema (OpenAPI-subset) for /assessment/generate. */
const ASSESSMENT_SCHEMA = {
  type: 'OBJECT',
  properties: {
    topic: { type: 'STRING' },
    difficulty: { type: 'STRING' },
    title: { type: 'STRING' },
    description: { type: 'STRING' },
    questions: {
      type: 'ARRAY',
      minItems: 10,
      maxItems: 40,
      items: {
        type: 'OBJECT',
        properties: {
          id: { type: 'STRING' },
          type: { type: 'STRING', enum: ['mcq', 'output', 'debug', 'scenario', 'tradeoff', 'coding', 'cross-topic'] },
          skill: { type: 'STRING' },
          difficulty: { type: 'STRING', enum: ['beginner', 'intermediate', 'advanced', 'interview-hard'] },
          prompt: { type: 'STRING' },
          code: { type: 'STRING' },
          options: { type: 'ARRAY', items: { type: 'STRING' } },
          correctOptionIndex: { type: 'INTEGER' },
          starterCode: { type: 'STRING' },
          expectedConcepts: { type: 'ARRAY', items: { type: 'STRING' } }
        },
        required: ['id', 'type', 'skill', 'difficulty', 'prompt']
      }
    }
  },
  required: ['topic', 'difficulty', 'title', 'description', 'questions']
};

/** Gemini structured-output schema for /assessment/evaluate. */
const EVALUATION_SCHEMA = {
  type: 'OBJECT',
  properties: {
    results: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          questionId: { type: 'STRING' },
          result: { type: 'STRING', enum: ['correct', 'partially_correct', 'incorrect'] },
          score: { type: 'INTEGER' },
          summary: { type: 'STRING' },
          strengths: { type: 'ARRAY', items: { type: 'STRING' } },
          gaps: { type: 'ARRAY', items: { type: 'STRING' } },
          idealReasoning: { type: 'ARRAY', items: { type: 'STRING' } },
          conceptsToReview: { type: 'ARRAY', items: { type: 'STRING' } }
        },
        required: ['questionId', 'result', 'score', 'summary']
      }
    },
    overallStrongAreas: { type: 'ARRAY', items: { type: 'STRING' } },
    overallWeakAreas: { type: 'ARRAY', items: { type: 'STRING' } }
  },
  required: ['results', 'overallStrongAreas', 'overallWeakAreas']
};

function corsHeaders(origin: string | null, allowedOrigins: string[]): Record<string, string> {
  const allowOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0] ?? '';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin'
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean);
    const origin = request.headers.get('Origin');
    const headers = corsHeaders(origin, allowedOrigins);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    const url = new URL(request.url);
    const isKnownRoute =
      request.method === 'POST' && ['/ask', '/assessment/generate', '/assessment/evaluate'].includes(url.pathname);
    if (!isKnownRoute) {
      return new Response('Not found', { status: 404, headers });
    }

    // CORS headers alone only stop a BROWSER from reading a cross-origin
    // response, they don't stop a raw curl/script request from being sent.
    // This explicit check rejects any request claiming an Origin we don't
    // recognize, as a second layer of defense.
    if (origin && !allowedOrigins.includes(origin)) {
      return new Response('Forbidden', { status: 403, headers });
    }

    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const limit = Number(env.RATE_LIMIT_PER_HOUR ?? '20');
    const rateLimitKey = `rl:${ip}`;
    const currentRaw = await env.RATE_LIMIT_KV.get(rateLimitKey);
    const current = currentRaw ? Number(currentRaw) : 0;

    if (current >= limit) {
      return new Response('Rate limit exceeded. Try again in a bit.', { status: 429, headers });
    }
    await env.RATE_LIMIT_KV.put(rateLimitKey, String(current + 1), { expirationTtl: 3600 });

    if (url.pathname === '/ask') return handleAsk(request, env, headers);
    if (url.pathname === '/assessment/generate') return handleGenerateAssessment(request, env, headers);
    return handleEvaluateAssessment(request, env, headers);
  }
};

async function handleAsk(request: Request, env: Env, headers: Record<string, string>): Promise<Response> {
  let body: { question?: string; context?: string };
  try {
    body = await request.json();
  } catch {
    return new Response('Invalid JSON body', { status: 400, headers });
  }

  const question = (body.question ?? '').trim().slice(0, 2000);
  const pageContext = (body.context ?? '').trim().slice(0, 6000);

  if (!question) {
    return new Response('Missing question', { status: 400, headers });
  }

  const prompt = pageContext ? `Page content:\n\n${pageContext}\n\nUser's question:\n${question}` : question;

  const model = env.GEMINI_MODEL ?? 'gemini-flash-latest';
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${env.GEMINI_API_KEY}`;

  const geminiResponse = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: ASK_SYSTEM_INSTRUCTION }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    })
  });

  if (!geminiResponse.ok || !geminiResponse.body) {
    const upstreamText = await geminiResponse.text().catch(() => '');
    return new Response(`AI service error (${geminiResponse.status}): ${upstreamText}`, { status: 502, headers });
  }

  return new Response(extractTextStream(geminiResponse.body), {
    status: 200,
    headers: { ...headers, 'Content-Type': 'text/plain; charset=utf-8' }
  });
}

async function handleGenerateAssessment(request: Request, env: Env, headers: Record<string, string>): Promise<Response> {
  let body: { topic?: string; difficulty?: string; questionCount?: number };
  try {
    body = await request.json();
  } catch {
    return new Response('Invalid JSON body', { status: 400, headers });
  }

  const topic = (body.topic ?? '').trim().slice(0, 200);
  const difficulty = (body.difficulty ?? 'intermediate').trim().toLowerCase();
  if (!topic) return new Response('Missing topic', { status: 400, headers });

  const countInstruction = body.questionCount
    ? `Generate exactly ${body.questionCount} questions.`
    : 'Decide the right question count yourself, between 10 and 40, based on how much this specific topic genuinely warrants - do not pad a narrow topic with filler.';

  const prompt =
    `Topic: ${topic}\n` +
    `Requested difficulty: ${difficulty}\n` +
    `${countInstruction}\n\n` +
    'Generate the mixed-format mock assessment now, following your system instructions exactly.';

  try {
    const assessment = await callGeminiJson(env, env.GEMINI_ASSESSMENT_MODEL ?? 'gemini-flash-latest', ASSESSMENT_GENERATION_SYSTEM_INSTRUCTION, prompt, ASSESSMENT_SCHEMA);
    return new Response(JSON.stringify(assessment), { status: 200, headers: { ...headers, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(`AI service error: ${(err as Error).message}`, { status: 502, headers });
  }
}

async function handleEvaluateAssessment(request: Request, env: Env, headers: Record<string, string>): Promise<Response> {
  let body: { topic?: string; difficulty?: string; items?: unknown[] };
  try {
    body = await request.json();
  } catch {
    return new Response('Invalid JSON body', { status: 400, headers });
  }

  const topic = (body.topic ?? '').trim().slice(0, 200);
  const items = Array.isArray(body.items) ? body.items : [];
  if (!topic || items.length === 0) {
    return new Response('Missing topic or items', { status: 400, headers });
  }

  const prompt =
    `Topic: ${topic}\n` +
    `Difficulty: ${(body.difficulty ?? 'intermediate')}\n\n` +
    'Evaluate the following question/answer pairs. Each item includes the question type, the question itself, ' +
    'any expected concepts or evaluation criteria, and the learner\'s submitted answer.\n\n' +
    JSON.stringify(items, null, 2);

  try {
    const evaluation = await callGeminiJson(env, env.GEMINI_ASSESSMENT_MODEL ?? 'gemini-flash-latest', ASSESSMENT_EVALUATION_SYSTEM_INSTRUCTION, prompt, EVALUATION_SCHEMA);
    return new Response(JSON.stringify(evaluation), { status: 200, headers: { ...headers, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(`AI service error: ${(err as Error).message}`, { status: 502, headers });
  }
}

/** A single, non-streaming Gemini call constrained to a fixed JSON schema, returning the already-parsed object. */
async function callGeminiJson(env: Env, model: string, systemInstruction: string, userPrompt: string, responseSchema: unknown): Promise<unknown> {
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;

  const response = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema
      }
    })
  });

  if (!response.ok) {
    const upstreamText = await response.text().catch(() => '');
    throw new Error(`upstream ${response.status}: ${upstreamText}`);
  }

  const data = (await response.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
  if (!text) throw new Error('empty response from model');

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('model returned malformed JSON');
  }
}


/**
 * Google's streamGenerateContent (alt=sse) response is a stream of
 * `data: {...}\n\n` events. This reads it line by line and re-emits ONLY the
 * plain text deltas, so the browser client needs no SSE/JSON parsing at all,
 * it just reads a plain growing text stream.
 */
function extractTextStream(googleBody: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '';

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = googleBody.getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const jsonStr = trimmed.slice('data:'.length).trim();
          if (!jsonStr || jsonStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const parts: Array<{ text?: string }> = parsed?.candidates?.[0]?.content?.parts ?? [];
            const text = parts.map((p) => p.text ?? '').join('');
            if (text) controller.enqueue(encoder.encode(text));
          } catch {
            // Incomplete/malformed JSON fragment, skip it.
          }
        }
      }
      controller.close();
    }
  });
}
