import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/dgit/ui/button";

/** Rises in once when it scrolls into view. `index` staggers siblings by 70 ms. */
export function Reveal({ children, index = 0, className, as: Tag = "div" }: { children: ReactNode; index?: number; className?: string; as?: "div" | "li" | "section" }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("mk-in"); io.disconnect(); } }, { rootMargin: "0px 0px -8% 0px" });
    io.observe(el); return () => io.disconnect();
  }, []);
  const T = Tag as "div";
  return <T ref={ref} className={cn("mk-reveal", className)} style={{ "--i": index } as CSSProperties}>{children}</T>;
}

/** Centered first screen: optional mark, big balanced title, one muted line, one pill CTA. */
export function Hero({ mark, title, sub, cta, children }: { mark?: ReactNode; title: string; sub: string; cta: string; children?: ReactNode }) {
  return (
    <section className="px-4 pt-12 text-center sm:pt-20">
      {mark && <Reveal index={0} className="mx-auto mb-8 flex justify-center">{mark}</Reveal>}
      <Reveal index={1}><h1 className="mk-display mx-auto max-w-[16ch] sm:max-w-3xl">{title}</h1></Reveal>
      <Reveal index={2}><p className="mx-auto mt-5 max-w-[34ch] text-copy-15 font-medium text-muted-foreground sm:max-w-md sm:text-[17px] sm:leading-7">{sub}</p></Reveal>
      <Reveal index={3} className="mt-9"><Button size="lg" className="active:scale-[0.97] px-7 text-base transition-[opacity,transform] duration-300">{cta}</Button></Reveal>
      {children}
    </section>
  );
}

/** Stage: a soft grainy surface; put a WindowFrame on it to show a product shot big. */
export function Stage({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mk-stage rounded-none px-4 py-14 sm:px-[8%] sm:py-20", className)}>{children}</div>;
}
export function WindowFrame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-xl shadow-card mk-frame">
      <div className="flex h-8 items-center gap-1.5 px-3">
        <i className="size-2.5 rounded-full bg-[#ff5f57]" /><i className="size-2.5 rounded-full bg-[#febc2e]" /><i className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-label-12 text-muted-foreground">{title}</span>
      </div>
      <div className="bg-background-100">{children}</div>
    </div>
  );
}

/** Section title, big, with an optional "See all" link on the right. */
export function SectionHead({ title, action, center }: { title: string; action?: string; center?: boolean }) {
  return (
    <div className={cn("mb-10 flex items-end justify-between gap-6 sm:mb-14", center && "justify-center text-center")}>
      <Reveal><h2 className="mk-h1">{title}</h2></Reveal>
      {action && <a href="#top" className="active:scale-[0.97] text-copy-15 text-muted-foreground transition-colors hover:text-foreground">{action}</a>}
    </div>
  );
}

/** Feature tile: a big rounded gray surface holding a demo, then a title and one line. The surface darkens on hover. */
export function FeatureTile({ visual, title, body, index = 0 }: { visual: ReactNode; title: string; body: string; index?: number }) {
  return (
    <Reveal index={index} className="group">
      <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-gray-100 transition-colors duration-[400ms] group-hover:bg-gray-200">{visual}</div>
      <h3 className="mt-5 text-center text-heading-20">{title}</h3>
      <p className="mt-1.5 text-center text-copy-15 text-muted-foreground">{body}</p>
    </Reveal>
  );
}

/** Review wall: soft cards (avatar, name, role, big quote) stacked in columns of uneven height. */
export type Review = { name: string; role: string; text: string };
export function ReviewWall({ items }: { items: Review[] }) {
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
      {items.map((r, i) => (
        <Reveal key={r.name} index={i % 3} className="mb-4 break-inside-avoid">
          <figure className="rounded-3xl bg-gray-100 p-7">
            <figcaption className="flex items-center gap-3.5">
              <span aria-hidden className="flex size-14 items-center justify-center rounded-full bg-gray-300 text-heading-20">{r.name[0]}</span>
              <span><span className="block text-heading-16">{r.name}</span><span className="block text-copy-15 text-muted-foreground">{r.role}</span></span>
            </figcaption>
            <blockquote className="mt-6 text-[17px] leading-7">{r.text}</blockquote>
          </figure>
        </Reveal>
      ))}
    </div>
  );
}

/** FAQ: hairlines between rows, the + turns 45° into ×, the answer opens by height (grid-rows 0fr to 1fr). */
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-border border-y">
      {items.map((it, i) => (
        <div key={it.q}>
          <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-6 py-6 text-left text-heading-20">
            {it.q}<Plus className={cn("size-5 shrink-0 transition-transform duration-300", open === i && "rotate-45")} />
          </button>
          <div className={cn("grid transition-[grid-template-rows] duration-300", open === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
            <p className="min-h-0 overflow-hidden pr-10 text-copy-15 text-muted-foreground"><span className="block pb-6">{it.a}</span></p>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Article card: a near-square stage surface with big text, then a title and a meta line. */
export function ArticleCard({ title, meta, cover, index = 0 }: { title: string; meta: string; cover: ReactNode; index?: number }) {
  return (
    <Reveal index={index}>
      <a href="#top" className="group block">
        <div className="mk-stage grid aspect-[5/4] place-items-center rounded-3xl text-center text-heading-30 text-foreground transition-transform duration-[400ms] group-hover:scale-[0.99]">{cover}</div>
        <h3 className="mt-4 text-heading-20">{title}</h3>
        <p className="mt-1 text-copy-14 text-muted-foreground">{meta}</p>
      </a>
    </Reveal>
  );
}

/** Closing band: a big sentence and a CTA on a dot grid. */
export function DotBand({ title, cta }: { title: string; cta: string }) {
  return (
    <div className="mk-dots relative overflow-hidden rounded-[32px] bg-gray-100 px-6 py-20 text-center sm:py-28">
      <h2 className="mk-h1 mx-auto max-w-[18ch]">{title}</h2>
      <Button size="lg" className="active:scale-[0.97] mt-8 px-7 text-base">{cta}</Button>
    </div>
  );
}

/** Footer: link columns (bold title, muted links) and a huge faint wordmark cropped at the bottom. */
export function Footer({ cols, word }: { cols: { title: string; links: string[] }[]; word: string }) {
  return (
    <footer className="overflow-hidden px-4 pt-14 sm:px-8">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
        {cols.map((c) => (
          <div key={c.title}>
            <p className="text-heading-16">{c.title}</p>
            <ul className="mt-4 space-y-2.5">{c.links.map((l) => <li key={l}><a href="#top" className="text-copy-15 text-muted-foreground transition-colors hover:text-foreground">{l}</a></li>)}</ul>
          </div>
        ))}
      </div>
      <p aria-hidden className="mt-16 -mb-[0.28em] select-none text-center font-semibold leading-none tracking-[-0.05em] text-gray-200" style={{ fontSize: "min(24vw, 340px)" }}>{word}</p>
    </footer>
  );
}
