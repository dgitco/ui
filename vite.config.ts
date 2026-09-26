import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const at = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// The registry sources import `@/lib/utils` and `@/registry/dgit/…`, the paths they'll have in a
// project after `shadcn add`; the site resolves them to this repo. `~` is the site's own code.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: "@/lib/utils", replacement: at("./src/lib/utils.ts") },
      { find: "@/registry", replacement: at("./registry") },
      { find: "~", replacement: at("./src") },
    ],
  },
});
