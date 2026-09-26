import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A page's title (30px, tight) with an optional line under it and an action on the right. */
export function PageHeader({ title, children, action, className }: { title: string; children?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-8 flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <h1 className="text-heading-30 text-balance">{title}</h1>
        {children && <p className="mt-2 text-muted-foreground text-pretty">{children}</p>}
      </div>
      {action}
    </div>
  );
}

/** A block of a page with a small muted heading. */
export function Section({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("mb-10", className)}>
      {title && <h2 className="mb-3 text-sm font-medium text-muted-foreground">{title}</h2>}
      {children}
    </section>
  );
}

/** Rows in a rounded, bordered box, divided by hairlines. */
export function List({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("divide-y rounded-2xl border", className)}>{children}</div>;
}

/** A short message: warn (amber), error, or ok (a plain outline). */
export function Notice({ tone = "warn", children, className }: { tone?: "warn" | "error" | "ok"; children: ReactNode; className?: string }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-2xl px-4 py-3 text-[13px] leading-[1.45]",
        tone === "warn" && "bg-warn-bg text-warn",
        tone === "error" && "bg-destructive/10 text-destructive",
        tone === "ok" && "border text-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** "3 days ago", "just now". */
export function ago(ms: number, locale?: string): string {
  const fmt = locale ? new Intl.RelativeTimeFormat(locale, { numeric: "auto" }) : rtf;
  const s = Math.round((ms - Date.now()) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, size] of units) if (Math.abs(s) >= size) return fmt.format(Math.round(s / size), unit);
  return fmt.format(0, "second");
}
