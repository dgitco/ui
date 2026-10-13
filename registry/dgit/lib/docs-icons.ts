/*
 * Icons for lib/docs.ts (<Card icon="…">, <Icon icon="…" />): lucide icons as SVG strings, with no
 * framework. The `lucide` package exports each icon as an IconNode; import only the ones your pages
 * use, so a Worker bundles those few and not the whole set:
 *
 *   import { House, Settings } from "lucide";
 *   import { lucideIcons } from "@/lib/docs-icons";
 *   renderMarkdown(md, { icon: lucideIcons({ House, Settings }) });
 *
 * Mintlify pages name Font Awesome icons; FA_TO_LUCIDE turns those into lucide's (`gear` → settings),
 * and docIcons() lists the lucide exports a page needs, to write the import above.
 */

/** lucide's icon format: the SVG's children as [tag, attributes]. */
export type IconNode = [tag: string, attrs: Record<string, string | number | undefined>][];

/** An IconNode as an <svg> string: 24×24 view box, stroke in currentColor, hidden from screen readers. */
export function svgIcon(node: IconNode, o: { size?: number; strokeWidth?: number } = {}): string {
  const size = o.size ?? 16;
  const kids = node
    .map(([tag, attrs]) => `<${tag}${Object.entries(attrs).map(([k, v]) => (v === undefined || k === "key" ? "" : ` ${k}="${String(v).replace(/"/g, "&#34;")}"`)).join("")}/>`)
    .join("");
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${o.strokeWidth ?? 2}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${kids}</svg>`;
}

/**
 * Font Awesome names (as Mintlify pages write them) to lucide names. First every icon the Photoito
 * guide uses, its pages and docs.json (brands and names lucide doesn't have go to the nearest
 * shape: apple → apple, google-play → play), then common ones. A name not here is tried as a
 * lucide name as it is.
 */
export const FA_TO_LUCIDE: Record<string, string> = {
  // The Photoito guide
  apple: "apple",
  bell: "bell",
  bullhorn: "megaphone",
  "chart-column": "chart-column",
  "clock-rotate-left": "rotate-ccw-clock",
  "cloud-arrow-up": "cloud-upload",
  coins: "coins",
  comments: "messages-square",
  "credit-card": "credit-card",
  dashboard: "layout-dashboard",
  desktop: "monitor",
  "digital-tachograph": "layout-dashboard",
  display: "monitor",
  droplet: "droplet",
  folder: "folder",
  gear: "settings",
  "google-play": "play",
  house: "house",
  image: "image",
  key: "key",
  "mobile-screen": "smartphone",
  "plane-landing-gear": "globe",
  "power-off": "power",
  receipt: "receipt",
  "ruler-combined": "ruler-dimension-line",
  "share-nodes": "share-2",
  seedling: "sprout",
  sliders: "sliders-horizontal",
  store: "store",
  "table-columns": "columns-2",
  ticket: "ticket",
  "triangle-exclamation": "triangle-alert",
  tv: "tv",
  "user-group": "users",
  "wand-magic-sparkles": "wand-sparkles",
  warning: "triangle-alert",
  // Common ones
  "arrow-up-right-from-square": "external-link",
  "arrows-rotate": "refresh-cw",
  bolt: "zap",
  book: "book",
  "book-open": "book-open",
  "calendar-days": "calendar-days",
  camera: "camera",
  "cart-shopping": "shopping-cart",
  "chart-line": "chart-line",
  "circle-check": "circle-check",
  "circle-exclamation": "circle-alert",
  "circle-info": "info",
  "circle-play": "circle-play",
  "circle-question": "circle-question-mark",
  "circle-xmark": "circle-x",
  envelope: "mail",
  "file-lines": "file-text",
  fire: "flame",
  gauge: "gauge",
  headset: "headset",
  lightbulb: "lightbulb",
  "list-check": "list-checks",
  "magnifying-glass": "search",
  "money-bill": "banknote",
  pen: "pen",
  "pen-to-square": "square-pen",
  print: "printer",
  qrcode: "qr-code",
  rotate: "refresh-cw",
  "screwdriver-wrench": "wrench",
  "trash-can": "trash",
  xmark: "x",
};

/** "rotate-ccw-clock" → "RotateCcwClock", the name lucide exports it under. */
export const lucideExport = (name: string) => name.replace(/(^|-)([a-z0-9])/g, (_, __, ch: string) => ch.toUpperCase());

/**
 * The `icon` option for renderMarkdown(): a Font Awesome or lucide name to the icon's SVG, from the
 * lucide icons you pass by their export names ({ House, Settings }). Nothing for a name not passed.
 */
export function lucideIcons(icons: Record<string, IconNode>, o: { size?: number; strokeWidth?: number } = {}) {
  return (name: string): string | undefined => {
    const node = icons[lucideExport(FA_TO_LUCIDE[name] ?? name)];
    return node && svgIcon(node, o);
  };
}

/** The lucide exports a page's icon="…" attributes need, sorted: `import { … } from "lucide"`. */
export const docIcons = (md: string) =>
  [...new Set([...md.matchAll(/\bicon=["'{]+([\w-]+)/g)].map((m) => lucideExport(FA_TO_LUCIDE[m[1]!] ?? m[1]!)))].sort();
