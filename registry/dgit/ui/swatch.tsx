import { useRef, useState, type KeyboardEvent } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Color picker: a 4-column grid; the chosen color gets a dark ring. Arrow keys move (one tab stop).
 * Pass `onAdd` to show a trailing "+": it returns the new color (a CSS color string) or nothing to cancel.
 */
export function SwatchPalette({ colors, onAdd, onChange }: { colors: string[]; onAdd?: () => string | undefined; onChange?: (c: string) => void }) {
  const [list, setList] = useState(colors);
  const [sel, setSel] = useState(colors[0]);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const pick = (c: string) => { setSel(c); onChange?.(c); };
  const onKey = (e: KeyboardEvent) => {
    const i = list.indexOf(sel);
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : e.key === "ArrowDown" ? 4 : e.key === "ArrowUp" ? -4 : 0;
    const n = i + step;
    if (step && list[n]) { e.preventDefault(); pick(list[n]); refs.current[n]?.focus(); }
  };
  return (
    <div className="w-fit rounded-3xl bg-background-100 p-3 shadow-menu">
      <div role="radiogroup" aria-label="Colors" onKeyDown={onKey} className="grid grid-cols-4 gap-2.5">
        {list.map((c, i) => (
          <button key={`${c}-${i}`} ref={(el) => { refs.current[i] = el; }} type="button" role="radio" aria-checked={sel === c} aria-label={c} tabIndex={sel === c ? 0 : -1} onClick={() => pick(c)}
            className={cn("flex size-12 cursor-pointer items-center justify-center rounded-xl transition-shadow active:scale-[0.97]", sel === c && "ring-2 ring-foreground ring-offset-2 ring-offset-background-100")} style={{ background: c }} />
        ))}
        {onAdd && (
          <button type="button" aria-label="Add a color" onClick={() => { const c = onAdd(); if (c) { setList([...list, c]); pick(c); } }}
            className="flex size-12 cursor-pointer items-center justify-center rounded-xl border-2 border-foreground active:scale-[0.97]"><Plus className="size-5" /></button>
        )}
      </div>
    </div>
  );
}
