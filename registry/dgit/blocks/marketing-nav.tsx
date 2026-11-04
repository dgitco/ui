import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/registry/dgit/ui/button";
import { cn } from "@/lib/utils";

/** Glass bar on top: links in the middle, a pill CTA on the right, a hamburger on phones. The current link is dark, the rest muted. */
export function NavBar({ brand, links, cta }: { brand: string; links: { label: string; menu?: string[] }[]; cta: string }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(links[0].label);
  const [drop, setDrop] = useState<string | null>(null);
  return (
    <header className="nav-glass sticky top-0 z-30">
      <div className="mx-auto flex h-14 max-w-6xl items-center px-4 sm:px-8">
        <a href="#top" className="text-heading-20 tracking-tight">{brand}</a>
        <nav aria-label="Main" className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 md:flex">
          {links.map((l) => (
            <div key={l.label} className="relative" onMouseLeave={() => setDrop(null)}>
              <button type="button" onMouseEnter={() => l.menu && setDrop(l.label)} onClick={() => setActive(l.label)} aria-expanded={drop === l.label}
                className={cn("active:scale-[0.97] inline-flex items-center gap-1 text-label-14 font-medium transition-colors", active === l.label ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
                {l.label}{l.menu && <ChevronDown className="size-3.5" />}
              </button>
              {l.menu && drop === l.label && (
                <div className="animate-menu absolute left-1/2 top-full w-60 -translate-x-1/2 pt-3">
                  <ul className="shadow-menu rounded-2xl bg-popover p-1.5">
                    {l.menu.map((m) => <li key={m}><a href="#top" className="block rounded-lg px-3 py-2 text-copy-14 transition-colors hover:bg-gray-100">{m}</a></li>)}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </nav>
        <Button size="sm" className="ml-auto hidden md:inline-flex">{cta}</Button>
        <button type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)} className="active:scale-[0.97] -mr-2 ml-auto flex size-11 items-center justify-center md:hidden">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      <div className={cn("grid overflow-hidden transition-[grid-template-rows] duration-300 md:hidden", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="min-h-0"><div className="bg-background px-4 pb-4">
          {links.map((l, i) => <a key={l.label} href="#top" style={{ transitionDelay: open ? `${i * 40}ms` : "0ms" }} className={cn("block py-3 text-heading-20 transition-all duration-300", open ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0")}>{l.label}</a>)}
          <Button className="mt-2 w-full">{cta}</Button>
        </div></div>
      </div>
    </header>
  );
}
