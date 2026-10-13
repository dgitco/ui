import { afterLede, docMenu, docsLayout, prevNext, renderMarkdown, tocLinks, updatedLine } from "@/registry/dgit/lib/docs";
import { DOCS_CSS } from "@/registry/dgit/lib/docs-css";
import { lucideIcons } from "@/registry/dgit/lib/docs-icons";
import { Image, MessagesSquare, Settings } from "lucide";

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

<CodeGroup>
\`\`\`sh macOS
brew install acme
\`\`\`

\`\`\`sh Linux
curl -fsSL https://acme.dev/install | sh
\`\`\`
</CodeGroup>

Then open <Icon icon="gear" /> **Settings** and pick the <Tooltip tip="The machine customers stand at">kiosk</Tooltip>:

1. Choose the shop.

   \`\`\`json kiosk.json
   { "shop": "seoul-1" }
   \`\`\`

2. Press **Pair**. The code on the kiosk's screen is good for 5 minutes.

| Part | What it does |
| --- | --- |
| **Kiosk** | Takes the photos |
| **Dashboard** | Where you change prices and frames |

<Tabs>
  <Tab title="Card">
    Customers tap their card on the reader.
  </Tab>
  <Tab title="QR">
    Customers scan the code with their bank app.
  </Tab>
</Tabs>

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
  <Card title="Support" icon="comments" href="#">
    We answer in the chat.
  </Card>
</CardGroup>`;

/** Font Awesome names as Mintlify writes them (gear, comments), lucide's icons; only these three are bundled. */
const icon = lucideIcons({ Image, MessagesSquare, Settings });

const GROUPS = [
  { name: "Start", pages: [{ href: "#welcome", title: "Welcome" }, { href: "#install", title: "Install the kiosk" }] },
  { name: "Dashboard", pages: [{ href: "#frames", title: "Frames" }, { name: "Every day", open: true, pages: [{ href: "#sales", title: "Sales" }, { href: "#usage", title: "Usage" }] }] },
];

/** A docs page as lib/docs.ts writes it, with docs.css's rules (DGit colors). */
export function DocsDemo() {
  const r = renderMarkdown(PAGE, { icon, idPrefix: "demo" });
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
