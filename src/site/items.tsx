import { useState, type ReactNode } from "react";
import { House, KeyRound, Mail, Settings } from "lucide-react";
import { AccountMenu, ThemeSwitch } from "@/registry/dgit/ui/account-menu";
import { Button } from "@/registry/dgit/ui/button";
import { CopyField } from "@/registry/dgit/ui/copy";
import { Kbd, Menu, MenuItem, MenuLabel, MenuSeparator } from "@/registry/dgit/ui/menu";
import { List, Notice, PageHeader, Section } from "@/registry/dgit/ui/page";
import { Segmented } from "@/registry/dgit/ui/segmented";
import { AppHeader, navPill } from "@/registry/dgit/blocks/app-header";
import { AuthButton, AuthCodeField, AuthDivider, AuthField, AuthLayout, AuthNote, AuthTitle } from "@/registry/dgit/blocks/auth-page";
import { useTheme } from "@/registry/dgit/lib/theme";
import { DGitChip } from "./mark";

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
];

export const itemByName = (name: string | undefined) => ITEMS.find((i) => i.name === name);
export const pathOf = (i: Item) => (i.kind === "block" ? `/blocks/${i.name}` : `/components/${i.name}`);
export { AccountDemo, AuthDemo, ButtonsDemo, HeaderDemo, MenuDemo, SegmentedDemo };
