# AI Proxy (Cloudflare Worker)

A thin, secret-holding proxy in front of the Gemini API. The Angular site
(hosted on GitHub Pages, static-only) calls this Worker instead of Google
directly, so the Gemini API key never appears in the public repo or the
browser bundle.

## One-time setup

```bash
cd ai-proxy
npm install
npx wrangler login          # authorizes wrangler against your Cloudflare account

# Create the KV namespace used for per-IP rate limiting, then copy the
# printed "id" into wrangler.toml under [[kv_namespaces]].
npm run kv:create

# Set your real Gemini API key as a Worker secret. This prompts for the key
# interactively, type it directly into the terminal - never paste it into
# any file in this repo.
npm run secret:set-key
```

Edit `wrangler.toml`:
- `ALLOWED_ORIGINS` - add your GitHub Pages URL (and keep `http://localhost:4300` for local dev).
- `RATE_LIMIT_PER_HOUR` - how many questions one visitor can ask per hour (default 20).

## Local development

```bash
cp .dev.vars.example .dev.vars   # then edit .dev.vars with your real key (gitignored, never committed)
npm run dev                      # starts wrangler dev on http://127.0.0.1:8787
```

The Angular app's `src/environments/environment.ts` already points at
`http://127.0.0.1:8787` for local `ng serve`.

## Deploy

```bash
npm run deploy
```

Wrangler prints your live Worker URL, something like
`https://indepth-coding-ai-proxy.<your-subdomain>.workers.dev`. Paste that
into `src/environments/environment.prod.ts` as `aiProxyUrl`, then rebuild and
redeploy the Angular site.

## Why this is safe to make public

- The Gemini API key only ever exists as a Cloudflare Worker secret, set via
  `wrangler secret put`. It is never written to any file in this repo.
- CORS restricts which origins get a usable response, and the Worker also
  explicitly rejects requests claiming an unrecognized `Origin` header.
- Per-IP rate limiting (via KV) caps how many questions any one visitor can
  ask per hour, protecting your Google quota/billing from abuse.
