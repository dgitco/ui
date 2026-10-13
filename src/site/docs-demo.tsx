import { afterLede, docMenu, docsLayout, prevNext, renderMarkdown, tocLinks, updatedLine } from "@/registry/dgit/lib/docs";
import { DOCS_CSS } from "@/registry/dgit/lib/docs-css";

const PAGE = `# Install the kiosk

Everything to have ready on the day, and what happens when the installer comes.

<Note>
  Prices change: the current ones are on the **Billing** page.
</Note>

## Before the day

<Steps>
  <Step title="Connect every device">
    Plug in the camera, the printer and the card reader, and turn them on.
  </Step>
  <Step title="Send us your logo">
    A PNG with a transparent background, 2000px or wider.
  </Step>
  <Step title="Check the network" />
</Steps>

## Set up the app

<Tabs>
  <Tab title="macOS">
    \`\`\`sh
    brew install acme
    \`\`\`
  </Tab>
  <Tab title="Linux">
    \`\`\`sh
    curl -fsSL https://acme.dev/install | sh
    \`\`\`
  </Tab>
</Tabs>

| Part | What it does |
| --- | --- |
| **Kiosk** | Takes the photos |
| **Dashboard** | Where you change prices and frames |

<Warning>
  Don't unplug the printer while it prints.
</Warning>

## If it doesn't work

<AccordionGroup>
  <Accordion title="The screen stays black">
    Hold the power button for 10 seconds, then turn it on again.
  </Accordion>
  <Accordion title="Photos don't arrive">
    1. Check the network cable.
    2. [Ask us](#) in the chat.
  </Accordion>
</AccordionGroup>

<CardGroup cols={2}>
  <Card title="Frames" icon="image" href="#">
    Upload the frames customers pick.
  </Card>
  <Card title="Support" icon="chat" href="#">
    We answer in the chat.
  </Card>
</CardGroup>`;

const ICON = (d: string) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICONS: Record<string, string> = {
  image: ICON('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>'),
  chat: ICON('<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>'),
};

const GROUPS = [
  { name: "Start", pages: [{ href: "#welcome", title: "Welcome" }, { href: "#install", title: "Install the kiosk" }] },
  { name: "Dashboard", pages: [{ href: "#frames", title: "Frames" }, { name: "Every day", open: true, pages: [{ href: "#sales", title: "Sales" }, { href: "#usage", title: "Usage" }] }] },
];

/** A docs page as lib/docs.ts writes it, with docs.css's rules (DGit colors). */
export function DocsDemo() {
  const r = renderMarkdown(PAGE, { icon: (n) => ICONS[n], idPrefix: "demo" });
  const article = afterLede(r.html, updatedLine("2026-10-13")) + prevNext({ href: "#welcome", title: "Welcome" }, { href: "#frames", title: "Frames" });
  const html = docsLayout({ menu: docMenu(GROUPS, "#install"), title: "Install the kiosk", article, toc: tocLinks(PAGE) });
  return (
    <div className="docs-demo h-full overflow-auto bg-background text-[15px]">
      <style>{`${[DOCS_CSS.tokens, DOCS_CSS.focus, DOCS_CSS.content, DOCS_CSS.layout, DOCS_CSS.extra].join("")}
.docs-demo .docs{grid-template-columns:170px minmax(0,1fr) 150px;gap:32px;padding:24px}
.docs-demo .dnav,.docs-demo .toc{top:24px}
@media (max-width:1100px){.docs-demo .docs{grid-template-columns:170px minmax(0,1fr)}}
@media (max-width:820px){.docs-demo .docs{grid-template-columns:minmax(0,1fr);padding:16px}}`}</style>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
