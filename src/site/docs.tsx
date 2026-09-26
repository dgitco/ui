import { Link } from "react-router";
import { Code } from "~/site/code";
import { ITEMS, pathOf } from "~/site/items";

const REGISTRY = `{
  "registries": {
    "@dgit": "https://ui.dgit.co/r/{name}.json"
  }
}`;

export function Docs() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-heading-30 mb-2">Get started</h1>
      <p className="mb-10 text-muted-foreground">
        DGit UI is a shadcn registry: <code className="font-mono">shadcn add</code> copies the source into your project, so you own it and can change it. It expects a shadcn project (a <code className="font-mono">components.json</code> and <code className="font-mono">cn</code> in <code className="font-mono">lib/utils</code>) on Tailwind v4.
      </p>

      <h2 className="text-heading-20 mb-3">1. Add the registry</h2>
      <p className="mb-3 text-muted-foreground">In <code className="font-mono">components.json</code>:</p>
      <Code code={REGISTRY} />

      <h2 className="text-heading-20 mt-10 mb-3">2. Add the theme and what you need</h2>
      <Code code="npx shadcn add @dgit/theme @dgit/use-theme @dgit/account-menu @dgit/app-header" />

      <h2 className="text-heading-20 mt-10 mb-3">3. Wire the theme</h2>
      <p className="mb-3 text-muted-foreground">Import the theme after Tailwind, and set the saved light/dark choice before the first paint:</p>
      <Code
        title="app/app.css"
        code={`@import "tailwindcss";
@import "./dgit.css";`}
      />
      <Code
        className="mt-3"
        title="root.tsx"
        code={`import { themeScript } from "~/lib/theme";

<head>
  <script dangerouslySetInnerHTML={{ __html: themeScript }} />
</head>`}
      />
      <p className="mt-3 text-muted-foreground">
        Load the fonts yourself: Geist and Geist Mono (the <code className="font-mono">geist</code> npm package or Google Fonts), and Pretendard if you need Korean.
      </p>

      <h2 className="text-heading-20 mt-10 mb-3">4. Let your agent use it</h2>
      <p className="mb-3 text-muted-foreground">
        The <code className="font-mono">dgit-ui</code> skill tells Claude Code, Codex and Cursor to build with this kit: which items exist, how to add them, and the rules of the look. Get it from{" "}
        <a href="/skill.md" className="text-foreground underline underline-offset-2">ui.dgit.co/skill.md</a> into your skills folder as <code className="font-mono">dgit-ui/SKILL.md</code>.
      </p>

      <h2 className="text-heading-20 mt-10 mb-3">Everything</h2>
      <div className="divide-y rounded-2xl border">
        {ITEMS.map((i) => (
          <Link key={i.name} to={pathOf(i)} className="flex items-baseline justify-between gap-4 px-4 py-3 text-foreground no-underline hover:bg-gray-100">
            <span className="font-medium">{i.title}</span>
            <span className="truncate font-mono text-label-13 text-muted-foreground">@dgit/{i.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
