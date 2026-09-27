// After a deploy, tell IndexNow search engines (Bing, which ChatGPT and Copilot search on, Naver,
// Yandex, ...) which pages exist. The key is public by design: public/<key>.txt proves the site is ours.
import { readdirSync, readFileSync } from "node:fs";

const key = readdirSync("public").find((f) => /^[0-9a-f]{32}\.txt$/.test(f))?.replace(".txt", "");
if (!key) throw new Error("indexnow: no public/<key>.txt");
const urlList = [...readFileSync("dist/sitemap.xml", "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: "ui.dgit.co", key, keyLocation: `https://ui.dgit.co/${key}.txt`, urlList }),
});
console.log(`IndexNow: ${urlList.length} URLs, HTTP ${res.status}`);
