import { useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

/** Date strip: only the chosen day floats as a big rounded square (card shadow, large number). Click or use left/right arrows. */
export function DateStrip({ days, value, onChange, label = "Date" }: { days: { key: string; dow: string; n: number }[]; value: string; onChange: (k: string) => void; label?: string }) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const onKey = (e: KeyboardEvent) => {
    const i = days.findIndex((d) => d.key === value);
    const n = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : i;
    if (n !== i && days[n]) { e.preventDefault(); onChange(days[n].key); refs.current[days[n].key]?.focus(); }
  };
  return (
    <div role="radiogroup" aria-label={label} onKeyDown={onKey} className="flex gap-1 overflow-x-auto py-6">
      {days.map((d) => {
        const on = d.key === value;
        return (
          <button key={d.key} ref={(el) => { refs.current[d.key] = el; }} type="button" role="radio" aria-checked={on} tabIndex={on ? 0 : -1} onClick={() => onChange(d.key)}
            className={cn("active:scale-[0.97] flex h-24 w-20 shrink-0 flex-col items-center justify-center rounded-[28px] transition-[background-color,box-shadow,color] duration-300", on ? "shadow-card bg-background-100 text-foreground" : "text-muted-foreground hover:text-foreground")}>
            <span className="text-heading-16 text-muted-foreground">{d.dow}</span>
            <span className="text-[34px] font-semibold leading-10 tracking-tight text-foreground">{d.n}</span>
          </button>
        );
      })}
    </div>
  );
}
