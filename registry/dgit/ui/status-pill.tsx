import { AlertCircle, XCircle, CheckCircle2, ChevronRight, Plus, Search, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Pill chip: a round icon well on the left, then the label. Status color lives only on the icon; the body stays white with the kit's card shadow. */
export type PillTone = "bad" | "warn" | "ok" | "neutral";
const tone: Record<PillTone, string> = { bad: "text-destructive", warn: "text-warn", ok: "text-ok", neutral: "text-foreground" };
export function StatusPill({ icon: Icon, label, tone: t = "neutral", pressed, onClick }: { icon: LucideIcon; label: string; tone?: PillTone; pressed?: boolean; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={pressed}
      className={cn("active:scale-[0.97] shadow-card inline-flex h-12 whitespace-nowrap shrink-0 items-center gap-3 rounded-full bg-background-100 py-1.5 pl-1.5 pr-6 text-heading-16 transition-shadow hover:shadow-card", pressed && "ring-2 ring-foreground")}>
      <span className="flex size-9 items-center justify-center rounded-full bg-gray-100"><Icon className={cn("size-4.5", tone[t])} strokeWidth={2} /></span>
      {label}
    </button>
  );
}
/** Icons for the usual statuses and actions. */
export const statusIcons = { bad: XCircle, warn: AlertCircle, ok: CheckCircle2, next: ChevronRight, add: Plus, search: Search };
