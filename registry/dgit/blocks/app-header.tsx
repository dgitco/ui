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
  return (
    <header className={cn("flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-[14px] sm:px-6 sm:py-[18px]", className)}>
      {brand}
      {nav ? (
        <nav className="order-last flex w-full gap-1 overflow-x-auto sm:order-none sm:w-auto" aria-label="Main">
          {nav}
        </nav>
      ) : null}
      <div className="flex min-w-0 items-center gap-2">{children}</div>
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
