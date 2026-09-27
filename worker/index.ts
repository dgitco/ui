// Serves the static site and registry, and counts registry fetches (/r/<item>.json) in D1.
// The counts are private: nothing here serves them; read them from D1 (dgit-ui-stats) directly.
// `shadcn add` fetches an item and then each of its registry dependencies, so dependencies
// (theme, use-theme) count once per install of anything that needs them.

interface D1Statement { bind(...values: unknown[]): D1Statement; run(): Promise<unknown> }
interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  STATS: { prepare(sql: string): D1Statement };
}
interface Ctx { waitUntil(promise: Promise<unknown>): void }

const ITEM = /^\/r\/([a-z0-9-]+)\.json$/;
const BOT = /bot|crawl|spider|slurp|preview|monitor|headless/i;

export default {
  async fetch(request: Request, env: Env, ctx: Ctx): Promise<Response> {
    const url = new URL(request.url);
    const response = await env.ASSETS.fetch(request);
    const item = ITEM.exec(url.pathname)?.[1];
    const ua = request.headers.get("user-agent") ?? "";
    // Unknown paths fall back to the site's index.html (200), so only JSON counts.
    const json = response.headers.get("content-type")?.includes("json");
    if (item && request.method === "GET" && response.ok && json && !BOT.test(ua)) {
      // A browser opening the JSON isn't an install; everything else (the shadcn CLI, agents) is.
      const client = ua.includes("Mozilla") ? "browser" : "cli";
      ctx.waitUntil(
        env.STATS.prepare(
          "INSERT INTO installs (day, item, client, n) VALUES (?, ?, ?, 1) ON CONFLICT (day, item, client) DO UPDATE SET n = n + 1",
        )
          .bind(kstDay(), item, client)
          .run()
          .catch(() => {}),
      );
    }
    return response;
  },
};

function kstDay(): string {
  return new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);
}
