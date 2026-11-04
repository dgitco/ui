import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/** Color picker: a 4-column grid ending in "+" (add your own). The chosen color gets a dark ring. */
export function SwatchPalette({ colors, onAdd }: { colors: string[]; onAdd?: (c: string) => void }) {
  const [list, setList] = useState(colors);
  const [sel, setSel] = useState(colors[0]);
  return (
    <div className="shadow-menu w-fit rounded-3xl bg-background-100 p-3">
      <div role="radiogroup" aria-label="Colors" className="grid grid-cols-4 gap-2.5">
        {list.map((c) => (
          <button key={c} role="radio" aria-checked={sel === c} aria-label={c} onClick={() => setSel(c)}
            className={cn("active:scale-[0.97] flex size-12 items-center justify-center rounded-xl transition-shadow", sel === c && "ring-2 ring-foreground ring-offset-2 ring-offset-background-100")} style={{ background: c }}>
            {sel === c && <Check className="size-4 text-white mix-blend-difference" />}
          </button>
        ))}
        <button type="button" aria-label="Add a color" onClick={() => { const c = `hsl(${Math.round(Math.random() * 360)} 55% 62%)`; setList([...list, c]); setSel(c); onAdd?.(c); }}
          className="active:scale-[0.97] flex size-12 items-center justify-center rounded-xl border-2 border-foreground"><Plus className="size-5" /></button>
      </div>
    </div>
  );
}
