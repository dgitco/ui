import { useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

/** Sliding tabs: one white pill glides to the chosen tab (measured, then translated). Arrow keys move; scrolls sideways on narrow screens. */
export function SlidingTabs<T extends string>({ value, options, onChange, label }: { value: T; options: readonly { value: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [box, setBox] = useState({ x: 0, w: 0, ready: false });
  useLayoutEffect(() => {
    const measure = () => {
      const el = refs.current[value]; if (!el) return;
      setBox({ x: el.offsetLeft, w: el.offsetWidth, ready: true });
    };
    measure();
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    return () => window.removeEventListener("resize", measure);
  }, [value, options]);
  const onKey = (e: KeyboardEvent) => {
    const i = options.findIndex((o) => o.value === value);
    const n = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : i;
    if (n !== i && options[n]) { e.preventDefault(); onChange(options[n].value); refs.current[options[n].value]?.focus(); }
  };
  return (
    <div className="max-w-full overflow-x-auto">
      <div role="tablist" aria-label={label} onKeyDown={onKey} className="relative inline-flex rounded-full bg-gray-200 p-1">
        <span aria-hidden className={cn("shadow-card absolute top-1 bottom-1 rounded-full bg-background-100", box.ready && "transition-[transform,width] duration-300 ease-out")} style={{ width: box.w, transform: `translateX(${box.x}px)` }} />
        {options.map((o) => (
          <button key={o.value} ref={(el) => { refs.current[o.value] = el; }} type="button" role="tab" aria-selected={value === o.value} tabIndex={value === o.value ? 0 : -1} onClick={() => onChange(o.value)}
            className={cn("relative z-10 whitespace-nowrap rounded-full px-5 py-2 text-heading-16 transition-colors duration-150", value === o.value ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>{o.label}</button>
        ))}
      </div>
    </div>
  );
}
