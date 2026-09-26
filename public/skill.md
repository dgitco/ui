---
name: dgit-ui
description: Use when building or restyling web UI in a React + Tailwind project — dashboards, settings and list pages, sign-in or login screens, app headers, account or profile menus, dropdowns, theme (light/dark) switches — for the user's own projects, or whenever DGit UI, @dgit or ui.dgit.co comes up. DGit UI is the user's shadcn registry; build with it instead of inventing styles or pulling in another component library.
---

# DGit UI

The user's UI kit: a shadcn registry at https://ui.dgit.co (previews and source for every item). `shadcn add` copies an item's source into the project; after that it's project code.

## Set up (once per project)

1. The project needs shadcn (`components.json`, `cn` in `lib/utils`) on Tailwind v4. If it has neither, run `npx shadcn init` first.
2. Add the registry to `components.json`:
   ```json
   "registries": { "@dgit": "https://ui.dgit.co/r/{name}.json" }
   ```
3. `npx shadcn add @dgit/theme @dgit/use-theme`, then import the theme right after Tailwind in the main CSS (`@import "./dgit.css";`) and put `themeScript` from `lib/theme` inline in `<head>`.
4. Load Geist and Geist Mono (the `geist` npm package or Google Fonts); add Pretendard for Korean text.

Don't let `shadcn add` replace an existing `lib/utils.ts`.

## Items

| Add | For |
|---|---|
| `@dgit/theme` | Colors (gray-100…gray-1000, background-100/200, gray-alpha-*; shadcn names on top), light/dark, type scale |
| `@dgit/use-theme` | `useTheme()` → "system" / "light" / "dark"; `themeScript` for `<head>` |
| `@dgit/button` | Pill buttons (40px; `sm` 32px). Variants: default, outline, ghost, destructive, link |
| `@dgit/menu` | `Menu`, `MenuItem`, `MenuSeparator`, `MenuLabel`, `Kbd`: any dropdown or popover list |
| `@dgit/account-menu` | Avatar button + menu (name, email, theme switch, links, log out). Header: default; sidebar bottom: `side="above" align="start"` |
| `@dgit/page` | `PageHeader`, `Section`, `List`, `Notice`, `ago()` |
| `@dgit/copy` | `CopyField`, `CopyButton` for URLs, commands, tokens |
| `@dgit/segmented` | 2–3 choice pill toggle |
| `@dgit/app-header` | Dashboard top bar: brand, `navPill()` links, account menu on the right |
| `@dgit/auth-page` | Sign-in screens: `AuthLayout`, `AuthTitle`, `AuthButton`, `AuthField`, `AuthCodeField`, `AuthDivider`, `AuthNote` |

Before writing a component, check whether an item already covers it, and add it. Open `https://ui.dgit.co/r/<item>.json` to read an item's source without installing it.

## The look (keep to it)

- Monochrome. Black on white, inverting in dark; color only for status (`text-ok`, `text-warn` on `bg-warn-bg`, `text-destructive`). No gradients, no colored cards, no emoji, no drop-shadowed boxes except menus (`shadow-menu`) and floating cards (`shadow-card`).
- Pills: buttons and text fields are fully rounded, 40px tall; nav links are small pills (`navPill`).
- Structure with hairlines: `List` (rounded-2xl box, rows divided by 1px lines) instead of cards per row; `border` is the only line color.
- Type: page titles `text-heading-30`; section titles small and muted (`Section`); body 15px; small print `text-copy-13 text-muted-foreground`; labels `text-label-14`. Values, IDs and commands in `font-mono`.
- Layout: dashboards put content in one centered column (`max-w-[640px]`) under `AppHeader`; sign-in screens use `AuthLayout` (no card, 384px column). Wide data pages may go to `max-w-6xl`.
- Theme: every screen works in light and dark. Use the theme's names (`bg-background`, `text-muted-foreground`, `bg-gray-100`…), never raw hex.
- Icons: lucide, 16px in rows and buttons.
- Accessible as drawn: real `<button>`/`<a>`, labels on icon-only buttons, visible focus.

## Changing the kit

Small tweaks: edit the copied file in the project. A change every project should get belongs in the kit: tell the user (the source is the dgitco/ui repo), and after it's published, `npx shadcn add @dgit/<item> --overwrite` updates a project.
