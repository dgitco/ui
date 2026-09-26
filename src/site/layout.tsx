import { Link, NavLink, Outlet, ScrollRestoration } from "react-router";
import { ThemeSwitch } from "@/registry/dgit/ui/account-menu";
import { navPill } from "@/registry/dgit/blocks/app-header";
import { useTheme } from "@/registry/dgit/lib/theme";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 font-mono text-[15px] font-semibold tracking-[-0.3px] text-foreground no-underline ${className}`}>
      <span className="grid size-7 place-content-center rounded-lg bg-foreground text-[12px] text-background">d/</span>
      DGIT UI
    </Link>
  );
}

export function Layout() {
  const [theme, setTheme] = useTheme();
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-transparent bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Wordmark />
          <nav className="hidden items-center gap-1 sm:flex" aria-label="Site">
            <NavLink to="/docs" className={({ isActive }) => navPill(isActive)}>
              Docs
            </NavLink>
            <NavLink to="/components/account-menu" className={({ isActive }) => navPill(isActive)}>
              Components
            </NavLink>
            <NavLink to="/blocks/auth-page" className={({ isActive }) => navPill(isActive)}>
              Blocks
            </NavLink>
          </nav>
          <ThemeSwitch value={theme} onChange={setTheme} />
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-copy-13 text-muted-foreground sm:px-6">
          <span>DGIT UI · a shadcn registry for quiet, sharp interfaces.</span>
          <span className="font-mono">npx shadcn add @dgit/…</span>
        </div>
      </footer>
      <ScrollRestoration />
    </div>
  );
}
