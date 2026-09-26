import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A floating panel opened from a trigger: account menus, pickers, small action lists.
 * 12px corners, the `shadow-menu` elevation, 36px rows with 8px sides and 6px corners, and a
 * 120 ms grow from the trigger's corner. Closes on Escape and on a click outside.
 */
function panelPosition(side: "below" | "above", align: "start" | "end", r: DOMRect): CSSProperties {
  const vertical = side === "above" ? { bottom: window.innerHeight - r.top + 4 } : { top: r.bottom + 4 };
  const horizontal = align === "end" ? { right: window.innerWidth - r.right } : { left: r.left };
  return { ...vertical, ...horizontal };
}

export function Menu({
  trigger,
  children,
  side = "below",
  align = "start",
  className,
  rootClassName,
  label,
}: {
  /** Render the button that opens it; call `toggle` on click. */
  trigger: (props: { open: boolean; toggle: () => void; "aria-expanded": boolean; "aria-haspopup": "menu" }) => ReactNode;
  children: (props: { close: () => void }) => ReactNode;
  side?: "below" | "above";
  align?: "start" | "end";
  /** Panel width and extras, e.g. "w-72". */
  className?: string;
  rootClassName?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !root.current) return;
    const update = () => setRect(root.current?.getBoundingClientRect() ?? null);
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!root.current?.contains(t) && !panel.current?.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className={cn("relative min-w-0", rootClassName)}>
      {trigger({ open, toggle: () => setOpen(!open), "aria-expanded": open, "aria-haspopup": "menu" })}
      {open && rect
        ? createPortal(
            <div
              ref={panel}
              role="menu"
              aria-label={label}
              style={panelPosition(side, align, rect)}
              className={cn(
                // On <body>, above dialogs, so no parent's stacking context can cover it.
                "fixed z-[70] min-w-[220px] overflow-hidden rounded-xl bg-popover p-1.5 text-popover-foreground shadow-menu animate-menu",
                side === "above" ? (align === "end" ? "origin-bottom-right" : "origin-bottom-left") : align === "end" ? "origin-top-right" : "origin-top-left",
                className,
              )}
            >
              {children({ close: () => setOpen(false) })}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

const ROW =
  "flex h-9 w-full cursor-pointer items-center gap-3 rounded-md border-0 bg-transparent px-2 text-left font-[inherit] text-label-14 text-foreground no-underline hover:bg-gray-100 focus-visible:bg-gray-100 focus-visible:outline-none";

/** One row: a button, or a link with `href`. The icon sits on the right, like a shortcut. */
export function MenuItem({
  children,
  icon,
  href,
  external,
  onSelect,
  checked,
  className,
}: {
  children: ReactNode;
  icon?: ReactNode;
  href?: string;
  external?: boolean;
  onSelect?: () => void;
  /** Shows a check on the right (for single-choice lists). */
  checked?: boolean;
  className?: string;
}) {
  const inner = (
    <>
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {checked !== undefined ? <Check className={cn("size-4 flex-none", checked ? "text-foreground" : "text-transparent")} /> : null}
      {icon ? <span className="flex size-4 flex-none items-center justify-center text-gray-900 [&_svg]:size-4">{icon}</span> : null}
    </>
  );
  if (href)
    return (
      <a role="menuitem" href={href} onClick={onSelect} className={cn(ROW, className)} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
        {inner}
      </a>
    );
  return (
    <button type="button" role="menuitem" aria-checked={checked} onClick={onSelect} className={cn(ROW, className)}>
      {inner}
    </button>
  );
}

/** A full-width rule between groups of rows. */
export function MenuSeparator() {
  return <hr className="-mx-1.5 my-1.5 border-0 border-t border-gray-200" />;
}

/** Non-interactive text at the top of a menu (who's signed in, a section name). */
export function MenuLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("px-2 py-2", className)}>{children}</div>;
}

/** A keycap: 20px tall, 4px corners, 12px text. */
export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-sm bg-background px-1 font-sans text-xs text-foreground shadow-[0_0_0_1px_var(--dgit-gray-alpha-400)]">
      {children}
    </kbd>
  );
}
