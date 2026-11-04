import { useState, type ReactNode } from "react";
import { BookOpen, Boxes, Cable, FolderGit2, House, KeyRound, LayoutGrid, Lock, Mail, Settings, Shield, Users } from "lucide-react";
import { AccountMenu, ThemeSwitch } from "@/registry/dgit/ui/account-menu";
import { Button } from "@/registry/dgit/ui/button";
import { CopyField } from "@/registry/dgit/ui/copy";
import { Kbd, Menu, MenuItem, MenuLabel, MenuSeparator } from "@/registry/dgit/ui/menu";
import { List, Notice, PageHeader, Section } from "@/registry/dgit/ui/page";
import { Segmented } from "@/registry/dgit/ui/segmented";
import { StatusPill, statusIcons } from "@/registry/dgit/ui/status-pill";
import { SlidingTabs } from "@/registry/dgit/ui/sliding-tabs";
import { DateStrip } from "@/registry/dgit/ui/date-strip";
import { TourTip, Checklist } from "@/registry/dgit/ui/tour";
import { SwatchPalette } from "@/registry/dgit/ui/swatch";
import { AppHeader, navPill } from "@/registry/dgit/blocks/app-header";
import { ScopeSwitcher, SidebarLayout, type LinkRenderer, type NavItem, type NavLayer } from "@/registry/dgit/blocks/sidebar-layout";
import { AuthButton, AuthCodeField, AuthDivider, AuthField, AuthLayout, AuthNote, AuthTitle } from "@/registry/dgit/blocks/auth-page";
import { AuthFlow, type AuthResult, type LookupAnswer } from "@/registry/dgit/blocks/auth-flow";
import { useTheme } from "@/registry/dgit/lib/theme";
import { NavBar } from "@/registry/dgit/blocks/marketing-nav";
import { ArticleCard, DotBand, Faq, FeatureTile, Footer, Hero, ReviewWall, SectionHead, Stage, WindowFrame } from "@/registry/dgit/blocks/marketing";
import { DGitChip } from "./mark";
import { DocsDemo } from "./docs-demo";

export interface Item {
  name: string;
  title: string;
  kind: "component" | "block" | "foundation";
  summary: string;
  preview: () => ReactNode;
  usage: string;
  /** Blocks render in a tall frame, the way they fill a page. */
  frame?: number;
}

const GITHUB = <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38v-1.34c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.72 1.22 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z" /></svg>;

function ButtonsDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button>Deploy</Button>
      <Button variant="outline">Preview</Button>
      <Button variant="ghost">Cancel</Button>
      <Button variant="destructive">Delete</Button>
      <Button size="sm" variant="outline">
        <KeyRound /> Passkey
      </Button>
    </div>
  );
}

function MenuDemo() {
  const [sort, setSort] = useState("newest");
  return (
    <Menu
      align="start"
      trigger={(p) => (
        <Button variant="outline" onClick={p.toggle} aria-expanded={p.open}>
          Sort: {sort}
        </Button>
      )}
    >
      {({ close }) => (
        <>
          <MenuLabel>
            <span className="text-label-12 text-gray-900">Sort by</span>
          </MenuLabel>
          {["newest", "oldest", "name"].map((s) => (
            <MenuItem key={s} checked={sort === s} onSelect={() => (setSort(s), close())}>
              {s[0]!.toUpperCase() + s.slice(1)}
            </MenuItem>
          ))}
          <MenuSeparator />
          <MenuItem icon={<Kbd>⌘K</Kbd>} onSelect={close}>
            Search
          </MenuItem>
        </>
      )}
    </Menu>
  );
}

function AccountDemo({ side = "below" as "below" | "above" }) {
  return (
    <AccountMenu
      name="Ada Lovelace"
      email="ada@example.com"
      side={side}
      align={side === "above" ? "start" : "end"}
      items={[
        { label: "Settings", icon: <Settings /> },
        { label: "Home page", icon: <House />, href: "/" },
      ]}
      onSignOut={() => {}}
    />
  );
}

function PageDemo() {
  return (
    <div className="w-full max-w-md text-left">
      <PageHeader title="Tokens">One per machine. Revoke one to sign that machine out.</PageHeader>
      <Section title="2 tokens">
        <List>
          {["work laptop", "home"].map((t, i) => (
            <div key={t} className="flex items-center justify-between px-4 py-3">
              <span className="font-medium">{t}</span>
              <span className="text-copy-13 text-muted-foreground">{i ? "3 days ago" : "just now"}</span>
            </div>
          ))}
        </List>
      </Section>
      <Notice>Copy your new token now. It won't be shown again.</Notice>
    </div>
  );
}

function StatusPillDemo() {
  const [on, setOn] = useState<string | null>(null);
  const rows = [["bad", "Needs fix", "bad"], ["warn", "At risk", "warn"], ["ok", "Verified", "ok"], ["next", "View details", "neutral"], ["add", "New project", "neutral"]] as const;
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {rows.map(([k, label, tone]) => <StatusPill key={k} icon={statusIcons[k]} label={label} tone={tone} pressed={on === k} onClick={() => setOn(on === k ? null : k)} />)}
    </div>
  );
}

function SlidingTabsDemo() {
  const [v, setV] = useState<"all" | "fix" | "risk" | "ok">("all");
  const rows = [["Deploy login", "fix"], ["Sync projects", "risk"], ["Rotate keys", "ok"], ["Backups", "ok"]] as const;
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4">
      <SlidingTabs label="Status" value={v} onChange={setV} options={[{ value: "all", label: "All" }, { value: "fix", label: "Needs fix" }, { value: "risk", label: "At risk" }, { value: "ok", label: "Verified" }]} />
      <List className="w-full">{rows.filter((r) => v === "all" || r[1] === v).map((r) => <div key={r[0]} className="px-4 py-3 text-copy-14">{r[0]}</div>)}</List>
    </div>
  );
}

function DateStripDemo() {
  const days = ["W", "T", "F", "S", "S", "M"].map((dow, i) => ({ key: `d${i}`, dow, n: 9 + i }));
  const [v, setV] = useState("d1");
  return <DateStrip days={days} value={v} onChange={setV} />;
}

function TourDemo() {
  const Box = ({ t }: { t: string }) => <div className="grid h-24 place-items-center text-label-13 text-muted-foreground">{t}</div>;
  return (
    <div className="flex flex-wrap items-start justify-center gap-10">
      <TourTip toolbar={[FolderGit2, LayoutGrid, Boxes, Settings]} steps={[{ title: "Projects", body: "Everything you build lives here.", preview: <Box t="Preview" /> }, { title: "Boards", body: "Lay cards out on one page.", preview: <Box t="Preview" /> }]} />
      <Checklist title="Get started" items={[{ id: "a", title: "Meet the toolbar", body: "Know what you can create.", preview: <Box t="Preview" /> }, { id: "b", title: "Write a page", body: "Notes that sit beside the canvas.", preview: <Box t="Preview" /> }]} />
    </div>
  );
}

function MarketingDemo() {
  const Ph = ({ t }: { t: string }) => <div className="grid h-full place-items-center text-label-13 text-muted-foreground">{t}</div>;
  return (
    <div className="marketing-scope">
      <NavBar brand="Acme" cta="Get started" links={[{ label: "Home" }, { label: "Solutions", menu: ["Teams", "Solo"] }, { label: "Pricing" }]} />
      <Hero title="Everything in one place." sub="Notes, plans and files on a single canvas." cta="Get started" />
      <div className="mt-10"><Stage><WindowFrame title="Project"><Ph t="Product screenshot" /></WindowFrame></Stage></div>
      <div className="mx-auto max-w-5xl px-4 py-14">
        <SectionHead title="Built for focus" center />
        <div className="grid gap-6 sm:grid-cols-3">{["Plan", "Track", "Hand off"].map((t, i) => <FeatureTile key={t} index={i} title={t} body="One line on what it does." visual={<Ph t="Demo" />} />)}</div>
        <div className="mt-16"><SectionHead title="What people say" /><ReviewWall items={[{ name: "Ada", role: "Designer", text: "Simple and clean. I stopped juggling tabs." }, { name: "Lin", role: "Engineer", text: "Everything I need sits in one place." }]} /></div>
        <div className="mx-auto mt-16 max-w-3xl"><SectionHead title="Questions" /><Faq items={[{ q: "Is it free?", a: "Yes, to start." }, { q: "Can I invite my team?", a: "Yes, anyone with a link." }]} /></div>
        <div className="mt-16"><SectionHead title="Articles" action="See all" /><div className="grid gap-6 sm:grid-cols-3"><ArticleCard title="How we built it" meta="Guide · 5 min" cover="Guide" /><ArticleCard index={1} title="Meet the canvas" meta="Product · 3 min" cover="Canvas" /></div></div>
      </div>
      <div className="px-4"><DotBand title="Start today." cta="Get started" /></div>
      <Footer word="acme" cols={[{ title: "Product", links: ["Features", "FAQ"] }, { title: "Company", links: ["About", "Contact"] }]} />
    </div>
  );
}

function SegmentedDemo() {
  const [v, setV] = useState<"secret" | "variable">("secret");
  return <Segmented value={v} onChange={setV} label="Kind" options={[{ value: "secret", label: "Secret" }, { value: "variable", label: "Variable" }]} />;
}

function ThemeDemo() {
  const [theme, setTheme] = useTheme();
  const steps = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-5">
      <div className="grid w-full grid-cols-10 overflow-hidden rounded-xl shadow-card">
        {steps.map((s) => (
          <div key={s} className="flex h-16 items-end p-1.5 font-mono text-[10px]" style={{ background: `var(--color-gray-${s})`, color: s >= 700 ? "var(--color-background-100)" : "var(--color-gray-1000)" }}>
            {s}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 text-label-14">
        Theme <ThemeSwitch value={theme} onChange={setTheme} />
      </div>
    </div>
  );
}

const SIDEBAR_NAV: NavItem[] = [
  { key: "overview", label: "Overview", to: "/", icon: <LayoutGrid /> },
  { key: "projects", label: "Projects", to: "/projects", icon: <FolderGit2 /> },
  { key: "connections", label: "Connections", to: "/connections", icon: <Cable /> },
  { key: "team", label: "Team", icon: <Users />, children: [
    { key: "members", label: "Members", to: "/team/members" },
    { key: "roles", label: "Roles", to: "/team/roles" },
  ] },
  { key: "h", heading: true, label: "Account" },
  { key: "security", label: "Security", to: "/security", icon: <Shield /> },
  { key: "docs", label: "Docs", to: "https://ui.dgit.co/docs", icon: <BookOpen />, external: true },
];
const DEMO_PROJECTS = ["api", "web", "worker"];

function SidebarDemo() {
  const [path, setPath] = useState("/projects/api/secrets");
  const link: LinkRenderer = ({ to, className, children, onClick, ...rest }) => (
    <button type="button" className={className + " border-0 bg-transparent"} onClick={() => (setPath(to), onClick?.())} {...rest}>
      {children}
    </button>
  );
  const project = /^\/projects\/([^/]+)/.exec(path)?.[1];
  const layer: NavLayer | null = project
    ? {
        key: project,
        title: project,
        back: { label: "All projects", to: "/projects" },
        items: [
          { key: "p-overview", label: "Overview", to: `/projects/${project}`, icon: <Boxes /> },
          { key: "p-secrets", label: "Secrets", to: `/projects/${project}/secrets`, icon: <Lock /> },
          { key: "p-settings", label: "Settings", to: `/projects/${project}/settings`, icon: <Settings /> },
        ],
      }
    : null;
  const page = path.split("/").filter(Boolean).at(-1) ?? "overview";
  return (
    <div className="relative h-full overflow-hidden [transform:translateZ(0)]">
      <SidebarLayout
        pathname={path}
        link={link}
        brand={<DGitChip />}
        nav={SIDEBAR_NAV}
        layer={layer}
        top={{
          left: (
            <ScopeSwitcher
              link={link}
              current={project ? { key: project, label: project } : null}
              all={{ label: "All projects", to: "/projects" }}
              items={DEMO_PROJECTS.map((p) => ({ key: p, label: p, to: `/projects/${p}` }))}
            />
          ),
          crumbs: project ? [{ label: "Projects", to: "/projects" }, { label: project, to: `/projects/${project}` }, ...(page !== project ? [{ label: page[0]!.toUpperCase() + page.slice(1) }] : [])] : [{ label: page[0]!.toUpperCase() + page.slice(1) }],
        }}
        footer={<AccountDemo />}
      >
        <div className="mx-auto w-full max-w-[640px] px-4 pt-8">
          <List>
            {DEMO_PROJECTS.map((p) => (
              <button key={p} type="button" onClick={() => setPath(`/projects/${p}`)} className="flex w-full cursor-pointer items-center justify-between border-0 bg-transparent px-4 py-3 text-left">
                <span className="font-medium">{p}</span>
                <span className="text-copy-13 text-muted-foreground">Open</span>
              </button>
            ))}
          </List>
        </div>
      </SidebarLayout>
    </div>
  );
}

function HeaderDemo() {
  const [at, setAt] = useState("Overview");
  return (
    <div className="flex h-full flex-col bg-background">
      <AppHeader
        brand={<DGitChip />}
        nav={["Overview", "Projects", "Usage", "Settings"].map((n) => (
          <button key={n} type="button" className={navPill(at === n) + " cursor-pointer border-0 bg-transparent"} onClick={() => setAt(n)}>
            {n}
          </button>
        ))}
      >
        <AccountDemo />
      </AppHeader>
      <div className="mx-auto w-full max-w-[640px] px-4 pt-10">
        <PageHeader title={at}>Everything in one place.</PageHeader>
        <List>
          {["api", "web", "worker"].map((p) => (
            <div key={p} className="flex items-center justify-between px-4 py-3">
              <span className="font-medium">{p}</span>
              <span className="text-copy-13 text-ok">Ready</span>
            </div>
          ))}
        </List>
      </div>
    </div>
  );
}

function AuthDemo() {
  const [step, setStep] = useState<"choose" | "code">("choose");
  return (
    <AuthLayout
      brand={<DGitChip />}
      app="Acme CLI"
      footer={<>One account for your tools. <a href="#">Terms</a> · <a href="#">Privacy</a></>}
    >
      {step === "choose" ? (
        <>
          <AuthTitle>Log into your account</AuthTitle>
          <AuthButton icon={<Mail />} onClick={() => setStep("code")}>
            Continue with email
          </AuthButton>
          <AuthButton icon={<KeyRound />}>Continue with passkey</AuthButton>
          <AuthButton icon={GITHUB}>Continue with GitHub</AuthButton>
        </>
      ) : (
        <>
          <AuthTitle sub={<>Enter the 6-digit code we sent to <b>ada@example.com</b></>}>Check your email</AuthTitle>
          <AuthCodeField placeholder="······" maxLength={7} aria-label="6-digit code" />
          <AuthButton primary>Continue</AuthButton>
          <AuthDivider />
          <AuthField type="email" placeholder="Email address" aria-label="Email address" />
          <AuthNote>
            The code expires in 5 minutes. <a href="#" onClick={(e) => (e.preventDefault(), setStep("choose"))}>Other ways to log in</a>
          </AuthNote>
        </>
      )}
    </AuthLayout>
  );
}

/** Fake server for the auth-flow preview: every call waits a moment, then answers by the email typed. */
const wait = (ms = 700) => new Promise((r) => setTimeout(r, ms));
const FAKE = {
  async lookup(email: string): Promise<LookupAnswer | { ok: false; error: string }> {
    await wait();
    const who = email.split("@")[0];
    if (who === "limit") return { ok: false, error: "rate_limited" };
    if (who === "outside") return { ok: false, error: "invite_required" };
    if (who === "down") throw new Error("offline");
    if (who === "new") return { account: "none" };
    if (who === "google") return { account: "exists", methods: { google: true, code: false } };
    if (who === "pw") return { account: "exists", methods: { password: true } };
    return { account: "exists", methods: { code: true } };
  },
  async sendCode(): Promise<AuthResult> {
    await wait();
    return { ok: true };
  },
  async verifyCode({ code }: { code: string }): Promise<AuthResult> {
    await wait();
    if (code === "123456") return { ok: true };
    if (code === "000000") return { ok: false, error: "code_expired" };
    return { ok: false, error: "code_invalid" };
  },
  async password({ password }: { password: string }): Promise<AuthResult> {
    await wait();
    return password === "password" ? { ok: true } : { ok: false, error: "password_invalid" };
  },
};

function AuthFlowDemo() {
  const [run, setRun] = useState(0);
  const [done, setDone] = useState(false);
  // Google: the demo can't leave, so it plays the round trip: the app shows `finishing` while it checks,
  // then Google "refused" comes back as `initialError`.
  const [finishing, setFinishing] = useState(false);
  const [googleError, setGoogleError] = useState<"google_failed" | undefined>();
  const google = async () => {
    await wait(600);
    setGoogleError(undefined);
    setFinishing(true);
    setTimeout(() => (setFinishing(false), setGoogleError("google_failed")), 900);
  };
  if (done)
    return (
      <AuthLayout brand={<DGitChip />}>
        <AuthTitle sub="The demo's onDone ran. A real app goes to its first page here.">Signed in</AuthTitle>
        <AuthButton onClick={() => (setDone(false), setGoogleError(undefined), setRun((r) => r + 1))}>Start over</AuthButton>
      </AuthLayout>
    );
  return (
    <AuthFlow
      key={run}
      brand={<DGitChip />}
      methods={{ code: true, google: true, password: true }}
      lookup={FAKE.lookup}
      sendCode={FAKE.sendCode}
      verifyCode={FAKE.verifyCode}
      password={FAKE.password}
      resetPassword={FAKE.sendCode}
      google={google}
      finishing={finishing}
      initialError={googleError}
      onDone={async () => {
        await wait(500);
        setDone(true);
      }}
      text={{ emailTitle: "보더에 로그인하기" }}
      footer={<>Try new@, google@, pw@, limit@, outside@ or down@ any domain · code 123456 (000000 expires) · password “password”</>}
    />
  );
}

export const ITEMS: Item[] = [
  {
    name: "theme",
    title: "Theme",
    kind: "foundation",
    summary: "A neutral gray scale in light and dark, shadcn's color names on it, and a type scale (text-heading-30, text-label-14, text-copy-13…).",
    preview: () => <ThemeDemo />,
    usage: `/* app.css */
@import "tailwindcss";
@import "./dgit.css";`,
  },
  {
    name: "use-theme",
    title: "useTheme",
    kind: "foundation",
    summary: "System, light or dark, kept in localStorage and set as <html data-theme>, with a first-paint script so there's no flash.",
    preview: () => <ThemeDemo />,
    usage: `import { themeScript, useTheme } from "@/lib/theme";

// in <head>
<script dangerouslySetInnerHTML={{ __html: themeScript }} />

const [theme, setTheme] = useTheme(); // "system" | "light" | "dark"`,
  },
  {
    name: "docs",
    title: "Docs",
    kind: "foundation",
    summary:
      "A docs site from Markdown, as HTML strings: no React needed, so it runs in a Worker too. Mintlify's components (Steps, Accordion, Note/Tip/Warning, Card, Frame, Columns, Tabs, CodeGroup, Icon, Tooltip) without JavaScript, lucide icons under Font Awesome's names, the side menu, On this page, previous/next, search (a JSON index and a few lines of script, no service), llms.txt, and the styles as strings or docs.css.",
    preview: () => <DocsDemo />,
    frame: 640,
    usage: `import { DOCS_SCRIPT, docMenu, docsLayout, docsSearch, frontMatter, renderMarkdown, searchIndex, tocLinks } from "@/lib/docs";
import { docsStyle } from "@/lib/docs-css";
import { lucideIcons } from "@/lib/docs-icons";
import { House, Settings } from "lucide"; // docIcons(body) lists the ones a page needs

const { data, body } = frontMatter(mdx);
const page = renderMarkdown(body, { icon: lucideIcons({ House, Settings }) }); // icon="gear" → Settings
const html =
  docsStyle({ tokens: true }) + // DGit colors; leave out tokens if you define --fg, --bg, --line…
  docsLayout({ menu: docMenu(groups, path), title: data.title, article: page.html, toc: tocLinks(body) }) +
  DOCS_SCRIPT;

// Search: write searchIndex(pages) to /search.json at build time, then
const search = docsSearch({ index: "/search.json" }); // search.button in the header, search.dialog before </body>
// with docsStyle({ tokens: true, search: true })

// In a React + Tailwind app: @import "./docs.css"; then
<article className="doc" dangerouslySetInnerHTML={{ __html: page.html }} />`,
  },
  {
    name: "button",
    title: "Button",
    kind: "component",
    summary: "Pill buttons, 40px by default. Black on white, inverting in dark.",
    preview: () => <ButtonsDemo />,
    usage: `import { Button } from "@/components/ui/button";

<Button>Deploy</Button>
<Button variant="outline">Preview</Button>`,
  },
  {
    name: "menu",
    title: "Menu",
    kind: "component",
    summary: "A floating panel opened from a trigger: 12px corners, 36px rows, grows from where you clicked. Closes on Escape and outside clicks.",
    preview: () => <MenuDemo />,
    usage: `import { Menu, MenuItem, MenuSeparator } from "@/components/ui/menu";

<Menu trigger={(p) => <Button onClick={p.toggle}>Sort</Button>}>
  {({ close }) => (
    <>
      <MenuItem checked onSelect={close}>Newest</MenuItem>
      <MenuSeparator />
      <MenuItem onSelect={close}>Search</MenuItem>
    </>
  )}
</Menu>`,
  },
  {
    name: "account-menu",
    title: "Account menu",
    kind: "component",
    summary: "A round avatar that opens who's signed in, a system/light/dark switch, your links, and log out.",
    preview: () => <AccountDemo />,
    usage: `import { AccountMenu } from "@/components/ui/account-menu";

<AccountMenu
  name={me.name}
  email={me.email}
  items={[{ label: "Settings", href: "/settings", icon: <Settings /> }]}
  onSignOut={signOut}
/>

// At the bottom of a sidebar: side="above" align="start"`,
  },
  {
    name: "page",
    title: "Page",
    kind: "component",
    summary: "PageHeader, Section, List (rounded rows divided by hairlines), Notice, and ago() for relative times.",
    preview: () => <PageDemo />,
    usage: `import { List, Notice, PageHeader, Section } from "@/components/ui/page";

<PageHeader title="Tokens">One per machine.</PageHeader>
<Section title="2 tokens">
  <List>{rows}</List>
</Section>`,
  },
  {
    name: "copy",
    title: "Copy",
    kind: "component",
    summary: "A monospace value with a copy button, for URLs, commands and tokens.",
    preview: () => <CopyField value="npx shadcn add @dgit/account-menu" className="w-full max-w-md" />,
    usage: `import { CopyField } from "@/components/ui/copy";

<CopyField value="https://api.example.com/mcp" />`,
  },
  {
    name: "segmented",
    title: "Segmented",
    kind: "component",
    summary: "Two or three choices in one small pill.",
    preview: () => <SegmentedDemo />,
    usage: `import { Segmented } from "@/components/ui/segmented";

<Segmented value={kind} onChange={setKind}
  options={[{ value: "secret", label: "Secret" }, { value: "variable", label: "Variable" }]} />`,
  },
  {
    name: "status-pill",
    title: "Status pill",
    kind: "component",
    summary: "A pill with a round icon well. Status color lives only on the icon; the body stays white.",
    preview: () => <StatusPillDemo />,
    usage: `import { StatusPill, statusIcons } from "@/components/ui/status-pill";

<StatusPill icon={statusIcons.ok} tone="ok" label="Verified" />`,
  },
  {
    name: "sliding-tabs",
    title: "Sliding tabs",
    kind: "component",
    summary: "Filter tabs: one white pill glides to the chosen tab. Arrow keys move; it scrolls sideways when narrow.",
    preview: () => <SlidingTabsDemo />,
    usage: `import { SlidingTabs } from "@/components/ui/sliding-tabs";

<SlidingTabs label="Status" value={tab} onChange={setTab}
  options={[{ value: "all", label: "All" }, { value: "fix", label: "Needs fix" }]} />`,
  },
  {
    name: "date-strip",
    title: "Date strip",
    kind: "component",
    summary: "Pick a day. Only the chosen day floats, as a large card with a big number.",
    preview: () => <DateStripDemo />,
    usage: `import { DateStrip } from "@/components/ui/date-strip";

<DateStrip days={[{ key: "d1", dow: "T", n: 10 }]} value={day} onChange={setDay} />`,
  },
  {
    name: "tour",
    title: "Tour",
    kind: "component",
    summary: "A first-run tip card joined to a toolbar, and a get-started checklist that opens one item at a time.",
    preview: () => <TourDemo />,
    usage: `import { TourTip, Checklist } from "@/components/ui/tour";

<TourTip toolbar={[Icon1, Icon2]} steps={[{ title: "Notes", body: "…", preview: <img … /> }]} />
<Checklist title="Get started" items={[{ id: "a", title: "…", body: "…", preview: <img … /> }]} />`,
  },
  {
    name: "swatch",
    title: "Swatch palette",
    kind: "component",
    summary: "A color grid. The last cell, +, adds your own.",
    preview: () => <SwatchPalette colors={["oklch(0.92 0 0)", "oklch(0.8 0.03 60)", "oklch(0.55 0.02 280)", "oklch(0.7 0.18 35)", "oklch(0.8 0.17 70)", "oklch(0.88 0.17 100)", "oklch(0.75 0.17 150)", "oklch(0.78 0.13 210)", "oklch(0.65 0.15 250)", "oklch(0.65 0.2 295)", "oklch(0.75 0.18 350)"]} onAdd={() => `oklch(0.72 0.14 ${Math.round(Math.random() * 360)})`} />,
    usage: `import { SwatchPalette } from "@/components/ui/swatch";

<SwatchPalette colors={colors} onChange={setColor} onAdd={() => pickFromSystem()} />`,
  },
  {
    name: "marketing",
    title: "Marketing",
    kind: "block",
    summary: "For landing and product pages only: glass nav, hero, gradient stage, feature tiles, review wall, FAQ, article cards, dot band, footer. App screens stay monochrome.",
    preview: () => <MarketingDemo />,
    frame: 900,
    usage: `// app/globals.css — after dgit.css; marketing pages only
@import "./marketing.css";

import { NavBar } from "@/components/marketing-nav";
import { Hero, Stage, WindowFrame, FeatureTile, Faq, Footer } from "@/components/marketing";

// Flat variant (no stage gradient, glass, or shadow): <html data-marketing="flat">`,
  },
  {
    name: "app-header",
    title: "App header",
    kind: "block",
    summary: "The top of a dashboard: brand, pill navigation, and the account menu on the right.",
    preview: () => <HeaderDemo />,
    frame: 460,
    usage: `import { AppHeader, navPill } from "@/components/app-header";

<AppHeader
  brand={<Logo />}
  nav={links.map((l) => (
    <NavLink key={l.to} to={l.to} className={({ isActive }) => navPill(isActive)}>{l.label}</NavLink>
  ))}
>
  <AccountMenu name={me.name} email={me.email} onSignOut={signOut} />
</AppHeader>`,
  },
  {
    name: "sidebar-layout",
    title: "Sidebar layout",
    kind: "block",
    summary: "A sidebar for dashboards with more places than fit in a row. Groups and places like a project slide in with a back row; the top bar has a scope switcher and breadcrumbs.",
    preview: () => <SidebarDemo />,
    frame: 520,
    usage: `import { ScopeSwitcher, SidebarLayout } from "@/components/sidebar-layout";

<SidebarLayout
  pathname={pathname}
  link={(p) => <Link to={p.to} className={p.className} onClick={p.onClick}>{p.children}</Link>}
  brand={<Logo />}
  nav={NAV}                                   // leaves, groups (drill in), headings
  layer={project ? projectLayer(project) : null} // a place in the URL, with a back row
  top={{ left: <ScopeSwitcher current={…} items={projects} all={{ label: "All projects", to: "/projects" }} />, crumbs }}
  footer={<AccountMenu side="above" align="start" name={me.name} onSignOut={signOut} />}
>
  <Outlet />
</SidebarLayout>`,
  },
  {
    name: "auth-page",
    title: "Sign-in page",
    kind: "block",
    summary: "No card: a centered 384px column, a 30px title, stacked 40px pill choices, a code field, and 'Signing in to <app>' when another app sent you.",
    preview: () => <AuthDemo />,
    frame: 620,
    usage: `import { AuthButton, AuthLayout, AuthTitle } from "@/components/auth-page";

<AuthLayout brand={<Logo />} app="Acme CLI">
  <AuthTitle>Log into your account</AuthTitle>
  <AuthButton icon={<Mail />}>Continue with email</AuthButton>
  <AuthButton icon={<KeyRound />}>Continue with passkey</AuthButton>
</AuthLayout>`,
  },
  {
    name: "auth-flow",
    title: "Sign-in flow",
    kind: "block",
    summary:
      "The whole sign-in from Neotax, monochrome: an email, then the app's lookup picks the step (6-digit code, password, passkey, Google-only, create account, two-step, forgot password). Server calls are props; strings are Korean by default, English with AUTH_TEXT_EN.",
    preview: () => <AuthFlowDemo />,
    frame: 680,
    usage: `import { AuthFlow } from "@/components/auth-flow";

<AuthFlow
  brand={<Logo />}
  methods={{ code: true, google: true }}            // also password, passkey, signup, twoFactor
  lookup={(email) => api("/login/lookup", { email })} // { account: "none" } | { account: "exists", methods }
  sendCode={(email, purpose) => api("/login/code", { email, purpose })}
  verifyCode={({ email, code }) => api("/login/code/verify", { email, code })}
  google={() => auth.signIn.social({ provider: "google" })}
  onDone={() => location.replace(next)}
  text={{ emailTitle: "보더에 로그인하기" }}     // or text={AUTH_TEXT_EN}
/>

// Every call answers { ok: true } or { ok: false, error: "code_invalid" | "rate_limited" | … }`,
  },
];

export const itemByName = (name: string | undefined) => ITEMS.find((i) => i.name === name);
export const pathOf = (i: Item) => (i.kind === "block" ? `/blocks/${i.name}` : `/components/${i.name}`);
export { AccountDemo, AuthDemo, AuthFlowDemo, ButtonsDemo, HeaderDemo, MenuDemo, SegmentedDemo };
