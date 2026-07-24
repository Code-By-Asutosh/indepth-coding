/**
 * Production environment config, swapped in at build time via
 * angular.json's `fileReplacements` for the `production` configuration.
 *
 * `aiProxyUrl` is the deployed Cloudflare Worker URL. This is safe to
 * commit - it is just a public endpoint URL, never the Gemini API key
 * itself (that lives only as a Worker secret, set via
 * `wrangler secret put GEMINI_API_KEY`, and never appears in this repo).
 *
 * Replace the placeholder below with your actual Worker URL after running
 * `npm run deploy` inside /ai-proxy (Wrangler prints the URL on deploy).
 */
export const environment = {
  production: true,
  aiProxyUrl: 'https://indepth-coding-ai-proxy.code-by-asutosh.workers.dev'
};
