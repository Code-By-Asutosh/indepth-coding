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
}

const SYSTEM_INSTRUCTION =
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
    if (url.pathname !== '/ask' || request.method !== 'POST') {
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

    // Bump the counter before calling Gemini so a burst of concurrent
    // requests can't all sneak in under the limit at once.
    await env.RATE_LIMIT_KV.put(rateLimitKey, String(current + 1), { expirationTtl: 3600 });

    const prompt = pageContext
      ? `Page content:\n\n${pageContext}\n\nUser's question:\n${question}`
      : question;

    const model = env.GEMINI_MODEL ?? 'gemini-2.0-flash';
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${env.GEMINI_API_KEY}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      })
    });

    if (!geminiResponse.ok || !geminiResponse.body) {
      // Surface the real upstream error to speed up debugging. Gemini's
      // error bodies describe things like an invalid key or a bad model
      // name, they never echo the key itself back, so this is safe to
      // return as-is.
      const upstreamText = await geminiResponse.text().catch(() => '');
      return new Response(`AI service error (${geminiResponse.status}): ${upstreamText}`, { status: 502, headers });
    }

    return new Response(extractTextStream(geminiResponse.body), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
};

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
