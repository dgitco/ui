import { useState, type ReactNode } from "react";
import { Check, X, type LucideIcon } from "lucide-react";
import { Button } from "@/registry/dgit/ui/button";
import { cn } from "@/lib/utils";

/** First-run tip: a dark card (preview, title, body, button) joined by a line to the toolbar below. Step dots show progress. */
export type TourStep = { title: string; body: string; preview: ReactNode };
export function TourTip({ steps, toolbar, onDone, nextLabel = "Next", doneLabel = "Got it", replayLabel = "Show the tour again", label = "Tool tour" }: { steps: TourStep[]; toolbar: LucideIcon[]; onDone?: () => void; nextLabel?: string; doneLabel?: string; replayLabel?: string; label?: string }) {
  const [i, setI] = useState(0);
  const [gone, setGone] = useState(false);
  if (gone) return <Button variant="outline" size="sm" onClick={() => { setI(0); setGone(false); }}>{replayLabel}</Button>;
  const s = steps[i], last = i === steps.length - 1;
  return (
    <div className="mx-auto flex w-full max-w-[320px] flex-col items-center">
      <div role="dialog" aria-label={label} className="w-full rounded-3xl bg-foreground p-3 text-background shadow-card">
        <div key={i} className="animate-menu overflow-hidden rounded-2xl bg-gray-100">{s.preview}</div>
        <div className="px-2 pt-3">
          <p className="text-heading-16">{s.title}</p>
          <p className="mt-1 text-copy-14 text-background/60">{s.body}</p>
        </div>
        <div className="mt-3 flex items-center justify-between px-2 pb-1">
          <div className="flex gap-1.5" aria-hidden>{steps.map((_, k) => <span key={k} className={cn("size-1.5 rounded-full transition-colors", k === i ? "bg-background" : "bg-background/30")} />)}</div>
          <button type="button" onClick={() => (last ? (setGone(true), onDone?.()) : setI(i + 1))} className="active:scale-[0.97] rounded-full bg-background px-4 py-1.5 text-label-14 font-medium text-foreground">{last ? doneLabel : nextLabel}</button>
        </div>
      </div>
      <span aria-hidden className="h-5 w-0.5 bg-foreground" /><span aria-hidden className="-mt-1 size-2 rounded-full bg-foreground" />
      <div className="bg-gray-100 shadow-card mt-1 flex gap-1 rounded-2xl p-1.5">
        {toolbar.map((Ic, k) => <span key={k} className={cn("flex size-10 items-center justify-center rounded-xl transition-colors", k === i ? "bg-background-100 text-foreground" : "text-gray-900")}><Ic className="size-5" /></span>)}
      </div>
    </div>
  );
}

/** Get-started checklist: one item open at a time (preview + body), checkbox on the right, close button. */
export type CheckItem = { id: string; title: string; body: string; preview: ReactNode };
export function Checklist({ title, items, openLabel = "Open checklist", closeLabel = "Close checklist" }: { title: string; items: CheckItem[]; openLabel?: string; closeLabel?: string }) {
  const [open, setOpen] = useState(items[0].id);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [shown, setShown] = useState(true);
  if (!shown) return <Button variant="outline" size="sm" onClick={() => setShown(true)}>{openLabel}</Button>;
  const n = items.filter((x) => done[x.id]).length;
  return (
    <div className="shadow-card w-full max-w-[340px] rounded-3xl bg-background-100 p-2">
      <div className="flex items-center justify-between px-3 pt-2 pb-1">
        <p className="text-label-13 text-muted-foreground">{title} · {n}/{items.length}</p>
        <button type="button" aria-label={closeLabel} onClick={() => setShown(false)} className="active:scale-[0.97] rounded-full p-1 text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
      </div>
      {items.map((it) => {
        const on = open === it.id;
        return (
          <div key={it.id} className={cn("rounded-2xl transition-colors", on && "bg-gray-100")}>
            <div className="flex items-center justify-between gap-3 px-3 py-2.5">
              <button type="button" aria-expanded={on} onClick={() => setOpen(on ? "" : it.id)} className="flex-1 text-left text-heading-14">{it.title}</button>
              <button type="button" role="checkbox" aria-checked={!!done[it.id]} aria-label={`${it.title}, done`} onClick={() => setDone({ ...done, [it.id]: !done[it.id] })}
                className={cn("active:scale-[0.97] flex size-5 items-center justify-center rounded-md border transition-colors", done[it.id] ? "border-foreground bg-foreground text-background" : "border-gray-600")}>{done[it.id] && <Check className="size-3.5" />}</button>
            </div>
            <div className={cn("grid transition-[grid-template-rows] duration-300", on ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
              <div className="min-h-0 overflow-hidden"><div className="px-3 pb-3"><div className="overflow-hidden rounded-xl bg-background-100">{it.preview}</div><p className="mt-2 text-copy-13 text-muted-foreground">{it.body}</p></div></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
