/**
 * Local development environment config.
 *
 * `aiProxyUrl` points at the deployed Cloudflare Worker (see
 * environment.prod.ts) so `ng serve` works without also running
 * `wrangler dev` locally. If you want to test Worker code changes without
 * redeploying every time, run `npm run dev` inside /ai-proxy and switch
 * this back to 'http://127.0.0.1:8787'. This file is safe to commit - it
 * holds no secrets, only a URL.
 */
export const environment = {
  production: false,
  aiProxyUrl: 'https://indepth-coding-ai-proxy.code-by-asutosh.workers.dev'
};
