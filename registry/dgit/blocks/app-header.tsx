import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The top bar of a dashboard: brand on the left, pill navigation in the middle (its own row on
 * phones), and whatever goes on the right (usually <AccountMenu />).
 *
 *   <AppHeader brand={<Logo />} nav={links.map(l => <NavLink className={({isActive}) => navPill(isActive)} …/>)}>
 *     <AccountMenu name={me.name} email={me.email} onSignOut={signOut} />
 *   </AppHeader>
 */
export function AppHeader({ brand, nav, children, className }: { brand: ReactNode; nav?: ReactNode; children?: ReactNode; className?: string }) {
  // Three columns from sm up, the outer two equal, so the nav sits in the middle of the page
  // however wide the brand side gets. On phones the nav takes its own row.
  return (
    <header className={cn("grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-3 px-4 py-[14px] sm:grid-cols-[1fr_auto_1fr] sm:px-6 sm:py-[18px]", className)}>
      <div className="flex min-w-0 items-center justify-self-start">{brand}</div>
      {nav ? (
        <nav className="order-last col-span-2 flex gap-1 overflow-x-auto sm:order-none sm:col-span-1" aria-label="Main">
          {nav}
        </nav>
      ) : (
        <span className="hidden sm:block" />
      )}
      <div className="flex min-w-0 items-center justify-self-end gap-2">{children}</div>
    </header>
  );
}

/** Classes for one navigation pill; the current page is filled. */
export function navPill(active: boolean): string {
  return cn(
    "rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap no-underline transition-colors",
    active ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground",
  );
}
