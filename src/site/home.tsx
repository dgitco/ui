import type { ReactNode } from "react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/registry/dgit/ui/button";
import { CopyField } from "@/registry/dgit/ui/copy";
import { Notice } from "@/registry/dgit/ui/page";
import { cn } from "@/lib/utils";
import { AccountDemo, AuthDemo, ButtonsDemo, HeaderDemo, MenuDemo, SegmentedDemo, pathOf, itemByName } from "~/site/items";

function Tile({ name, title, children, className, frame }: { name: string; title: string; children: ReactNode; className?: string; frame?: boolean }) {
  const item = itemByName(name)!;
  return (
    <div className={cn("group relative flex flex-col overflow-hidden rounded-2xl bg-background shadow-card", className)}>
      <div className={cn("relative flex min-h-0 flex-1 items-center justify-center overflow-hidden", frame ? "items-stretch [&>div]:h-full [&>div]:min-h-full! [&>div]:w-full" : "p-8")}>{children}</div>
      <Link to={pathOf(item)} className="flex items-center justify-between border-t px-4 py-3 text-label-14 text-foreground no-underline hover:bg-gray-100">
        <span className="font-medium">{title}</span>
        <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

export function Home() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--color-gray-alpha-400)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
        />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 pt-24 pb-16 text-center sm:pt-32">
          <div className="mb-6 rounded-full border bg-background px-3 py-1 font-mono text-label-12 text-muted-foreground">shadcn registry · React · Tailwind v4</div>
          <h1 className="text-[44px] leading-[1.05] font-semibold tracking-[-2px] text-balance sm:text-[64px] sm:tracking-[-3px]">Quiet, sharp interfaces.</h1>
          <p className="mt-5 max-w-xl text-[17px] leading-7 text-muted-foreground text-pretty">
            Dashboards and sign-in screens in one monochrome language: pill buttons, hairlines, a gray scale that holds up in the dark. Copy what you need; it's your code after.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/docs">Get started</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/components/account-menu">Browse components</Link>
            </Button>
          </div>
          <CopyField value="npx shadcn add @dgit/account-menu" className="mt-8 w-full max-w-sm text-left" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="grid gap-4 md:grid-cols-6">
          <Tile name="app-header" title="App header" className="h-[420px] md:col-span-4" frame>
            <HeaderDemo />
          </Tile>
          <Tile name="account-menu" title="Account menu" className="h-[420px] md:col-span-2">
            <div className="flex flex-col items-center gap-3 text-center">
              <AccountDemo />
              <p className="text-copy-13 text-muted-foreground">Tap the avatar</p>
            </div>
          </Tile>
          <Tile name="auth-page" title="Sign-in page" className="h-[520px] md:col-span-3" frame>
            <AuthDemo />
          </Tile>
          <div className="grid gap-4 md:col-span-3">
            <Tile name="button" title="Button">
              <ButtonsDemo />
            </Tile>
            <div className="grid gap-4 sm:grid-cols-2">
              <Tile name="menu" title="Menu">
                <MenuDemo />
              </Tile>
              <Tile name="segmented" title="Segmented">
                <SegmentedDemo />
              </Tile>
            </div>
          </div>
          <Tile name="page" title="Page parts" className="md:col-span-6">
            <Notice className="max-w-lg">Copy your new token now. It won't be shown again.</Notice>
          </Tile>
        </div>
      </section>
    </>
  );
}
