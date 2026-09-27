# DGit UI

[한국어](README.ko.md)

Quiet, sharp React components for dashboards and sign-in screens, as a [shadcn](https://ui.shadcn.com) registry (`@dgit`). `shadcn add` copies the source into your project, so you own it and can change it.

Site with previews, install commands, and source: **https://ui.dgit.co**

| Item | What it is |
|---|---|
| `theme` | Neutral gray scale in light and dark, shadcn's color names on it, a type scale |
| `use-theme` | System, light, or dark, saved and applied before first paint |
| `button` | Pill buttons, 40px tall by default |
| `menu` | A floating panel from a trigger, no positioning library |
| `account-menu` | Avatar button: who's signed in, a theme switch, your links, log out |
| `page` | PageHeader, Section, List, Notice, and `ago()` for relative times |
| `copy` | A monospace value with a copy button |
| `segmented` | Two or three choices in one small pill |
| `app-header` | Dashboard top bar: brand, pill navigation, account menu |
| `sidebar-layout` | Dashboard sidebar with drill-in groups, breadcrumbs, and a phone drawer |
| `auth-page` | Sign-in page: a centered column, pill choices, a code field |

## Use it in a project

React and Tailwind CSS v4 with shadcn set up (`components.json` and `cn` in `lib/utils`).

```json
// components.json
"registries": { "@dgit": "https://ui.dgit.co/r/{name}.json" }
```

```sh
npx shadcn add @dgit/theme @dgit/use-theme @dgit/account-menu @dgit/app-header
```

Import `dgit.css` after Tailwind in your main CSS (`@import "./dgit.css";`), and inline `themeScript` (from `lib/theme`) in `<head>`. See [Get started](https://ui.dgit.co/docs).

## Agent skill

[`skills/dgit-ui/SKILL.md`](skills/dgit-ui/SKILL.md) (also at https://ui.dgit.co/skill.md) tells Claude Code, Codex, or Cursor to build UI with this kit. Put it in the tool's skills folder as `dgit-ui/SKILL.md`.

## Layout

| Path | What |
|---|---|
| `registry/dgit/` | The kit: `styles/dgit.css` (theme), `lib/theme.ts`, `ui/*` (components), `blocks/*` (screens) |
| `registry.json` | The item list. `bun run registry` builds it into `public/r/<item>.json` |
| `src/` | The showcase site (Vite, React, Tailwind v4). Previews use the `registry/` sources directly |
| `scripts/seo.ts` | After the build, writes a static HTML page per route (title, description, structured data, text) plus `robots.txt`, `sitemap.xml`, and `llms.txt`, so crawlers that don't run JavaScript can read the site |
| `worker/` | Runs only for `/r/*` and counts registry fetches per day and item. The counts are private |

## Develop

```sh
bun install
bun run registry   # public/r, public/skill.md
bun run dev        # http://localhost:5173
bun run build      # registry, type check, site, SEO pages
bun run deploy     # Cloudflare (ui.dgit.co)
```

Registry sources import the paths they'll have in a project: `@/lib/utils`, `@/registry/dgit/…`. `shadcn add` rewrites them to the project's aliases. `utils` isn't in any item's `registryDependencies`, so installing the kit never replaces a project's existing `cn`.

## Credits

The sign-in screen and top bar come from 0bridge; the menus, account menu, and gray scale were rebuilt from measurements of Geist (the Vercel dashboard style). Icons are lucide; the font is Geist (SIL OFL).

## License

MIT. The Geist font is under the SIL Open Font License.
