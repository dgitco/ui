/*
 * DGit UI docs: Markdown (and the Mintlify components docs sites use) to an HTML string, plus the
 * pieces of a docs site around it: side menu, "On this page", previous/next, the ask row, llms.txt.
 * No framework and no DOM: it runs in a Worker, Node, Bun or the browser. Styles: lib/docs-css.ts
 * (strings) or docs.css (the same rules as a file).
 *
 * What it reads
 *  - The core, as 0bridge's docs print it: `#`–`###` headings with anchors, paragraphs, `-` and
 *    `1.` lists (a numbered list keeps its number past a code block), GFM tables, `>` notes, fenced
 *    code, `code`, **bold**, _italic_, links (https:, mailto:, /path, #anchor and relative pages).
 *  - Added (only where the core would have printed the text as it was): code fences with blank
 *    lines and titles (```js app.js), `####`–`######`, `---` rules, images, nested and `*`/`+`
 *    lists, a list right after a line of text, lists with blank lines between items or indented
 *    blocks (code, tables, paragraphs) under an item, `> [!NOTE]` alerts, `<br />`, front matter
 *    (`frontMatter()`).
 *  - Mintlify components, as Mintlify writes them (MDX, indented bodies, `cols={2}`):
 *    <Steps>/<Step title>, <Accordion title>/<AccordionGroup>, <Note>/<Tip>/<Info>/<Warning>/
 *    <Check>/<Danger>, <Card title href icon>/<CardGroup cols>, <Frame caption>, <Columns cols>,
 *    <Tabs>/<Tab title>, <CodeGroup>, and raw <img>, <br>, <div style={{…}}>. A component's body is
 *    Markdown; text after its closing tag on the same line carries on after it. In a line of text:
 *    <Icon icon size color /> and <Tooltip tip href>…</Tooltip>. No JavaScript: accordions are
 *    <details>, tabs and code groups are radio buttons, tooltips are title attributes.
 *  - Icons (Card, Icon) come from the `icon` option; lib/docs-icons.ts makes one from lucide icons,
 *    with Font Awesome's names (Mintlify's) mapped to lucide's.
 *  - Moving a site from Mintlify: `headingId: mintlifyHeadingId` keeps its section anchors, menu
 *    groups take Mintlify's group icons (DocGroup.icon), and docsScript(labels) speaks the page's language.
 *  - Search (opt in): searchIndex() at build time, docsSearch() for the button, dialog and script,
 *    DOCS_CSS.search for its styles. No service: a JSON file and a few lines of script.
 *
 * Input is trusted (your own docs): text is escaped, but the raw HTML above is passed through with
 * a short list of attributes and no javascript: URLs.
 */

/** HTML-escape text and attribute values: & < > " ' as numeric references. */
export const escape = (v: string) => v.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);

/** A heading's anchor: "Over SSH" → "over-ssh", "1. 처리 목적" → "1-처리-목적". */
export const headingId = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");

/**
 * Mintlify's anchors, for the `headingId` option: each space a hyphen, other letters and signs kept
 * (·, ×, 「」, %, ②), ASCII punctuation dropped, a closing parenthesis a space. "② 고르기" →
 * "②-고르기", "회전 시간 · 세션: 얼마나" → "회전-시간-·-세션-얼마나". Checked on 250 headings of the
 * Photoito guide against its Mintlify site.
 */
export const mintlifyHeadingId = (text: string) =>
  text
    .toLowerCase()
    .replace(/\)/g, " ")
    .replace(/[!-$&-,./:-@[-^`{-~]/g, "")
    .trim()
    .replace(/\s+/g, "-");

export interface MarkdownOptions {
  /**
   * SVG markup for `<Card icon="…">` and `<Icon icon="…" />` (Mintlify names Font Awesome or lucide
   * icons): lucideIcons() in lib/docs-icons.ts. No icon when it returns nothing.
   */
  icon?: (name: string) => string | undefined;
  /** Prefix for ids the renderer makes (tab groups), when several documents share a page. Default "md". */
  idPrefix?: string;
  /** The heading anchor's label for screen readers. Default "Link to this section". */
  anchorLabel?: string;
  /**
   * A heading's id from its text. Default headingId(). A site moving from another tool passes that
   * tool's rule, so links to its sections keep working (mintlifyHeadingId() for Mintlify).
   */
  headingId?: (text: string) => string;
}

export interface Rendered {
  html: string;
  /** True when anything beyond the core was used: the page then needs DOCS_CSS.extra too. */
  extended: boolean;
}

interface Ctx {
  o: MarkdownOptions;
  extended: boolean;
  ids: number;
  steps?: { n: number };
  tabs?: { name: string; n: number };
}

// ── Inline ─────────────────────────────────────────────────

const LINK = /\[([^\]]+)\]\(((?:https?:|mailto:)[^)\s]+|\/[^)\s]*|#[^)\s]*|(?![a-z][a-z0-9+.-]*:)[^)\s]+)\)/gi;
/** `![alt](src)` and `![alt](src "title")`, after escaping (quotes are &#34;). */
const IMAGE = /!\[([^\]]*)\]\(([^)\s]+)(?: &#34;([^)]*?)&#34;)?\)/g;

/** Inline Markdown on escaped text: `code`, **bold**, _italic_, images, [links](url), <br />, <Icon />, <Tooltip>. */
export function inline(s: string, o: Pick<MarkdownOptions, "icon"> = {}): string {
  let out = s
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
    .replace(/(^|\W)_([^_]+)_(?=\W|$)/g, "$1<i>$2</i>");
  if (out.includes("![")) out = out.replace(IMAGE, (_, alt: string, src: string, title?: string) => `<img src="${safeUrl(src)}" alt="${alt}"${title ? ` title="${title}"` : ""} loading="lazy">`);
  out = out.replace(LINK, '<a href="$2">$1</a>');
  if (out.includes("&#60;br")) out = out.replace(/&#60;br\s*\/?&#62;/g, "<br>");
  if (out.includes("&#60;Icon") || out.includes("&#60;Tooltip")) out = out.split(/(<code>.*?<\/code>)/).map((part, i) => (i % 2 ? part : part.replace(JSX_INLINE, (_, name: string, attrs: string, body?: string) => jsxInline(name, attrs, body, o)))).join("");
  return out;
}

/** <Icon … /> and <Tooltip …>…</Tooltip> in escaped text (quotes are &#34;). */
const JSX_ATTR = String.raw`\s+[A-Za-z]+(?:=(?:&#34;.*?&#34;|&#39;.*?&#39;|\{[^}]*\}))?`;
const JSX_INLINE = new RegExp(String.raw`&#60;(Icon|Tooltip)((?:${JSX_ATTR})*)\s*(?:\/&#62;|&#62;(.*?)&#60;\/\1&#62;)`, "g");

function jsxInline(name: string, attrs: string, body: string | undefined, o: Pick<MarkdownOptions, "icon">): string {
  const a: Record<string, string> = {};
  for (const m of attrs.matchAll(/([A-Za-z]+)(?:=(?:&#34;(.*?)&#34;|&#39;(.*?)&#39;|\{(.*?)\}))?/g)) a[m[1]!] = (m[2] ?? m[3] ?? m[4] ?? "true").replace(/^(&#34;|&#39;)(.*)\1$/, "$2").trim();
  if (name === "Icon") {
    const svg = a.icon && o.icon?.(a.icon);
    if (!svg) return "";
    const css = [/^\d+$/.test(a.size ?? "") ? `font-size:${a.size}px` : "", a.color ? `color:${a.color}` : ""].filter(Boolean).join(";");
    return `<span class="ic"${css ? ` style="${css}"` : ""}>${svg}</span>`;
  }
  const tip = a.tip ? ` title="${a.tip}"` : "";
  return a.href ? `<a class="tt" href="${safeUrl(a.href)}"${tip}>${body ?? ""}</a>` : `<span class="tt"${tip} tabindex="0">${body ?? ""}</span>`;
}

// ── Blocks ─────────────────────────────────────────────────

/** A fence's info string, "js app.js {1-3}": the language and the title (Mintlify's file name or tab label). */
const fenceInfo = (info: string) => {
  const [lang = "", ...rest] = info.replace(/\{[^}]*\}/g, "").trim().split(/\s+/);
  return { lang, title: rest.join(" ").replace(/^title=/, "").replace(/^(["'])(.*)\1$/, "$2") };
};
/** A code block; with a title, shown above the code (DOCS_CSS.extra). */
const pre = (code: string, title = "") => `<pre${title ? ` data-title="${escape(title)}"` : ""}><code>${escape(code)}</code></pre>`;

/** A table row's cells; `\|` is a literal pipe. */
const cells = (line: string) =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split(/(?<!\\)\|/)
    .map((c) => c.trim().replace(/\\\|/g, "|"));
const isTable = (lines: string[]) => lines.length >= 3 && lines.every((l) => l.startsWith("|")) && /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?$/.test(lines[1]!);

const ITEM = /^( *)([-*+]|\d+[.)]) +(.*)$/;

/** Lists the core doesn't take: nested, `*`/`+`, `1)`, wrapped lines, text right before the list. */
function list(lines: string[], c: Ctx): string | null {
  const first = lines.findIndex((l) => ITEM.test(l));
  if (first < 0 || lines.slice(first + 1).some((l) => !ITEM.test(l) && !/^ +\S/.test(l))) return null;
  if (lines.slice(0, first).some((l) => /^ /.test(l))) return null;
  interface Item { indent: number; ordered: boolean; n: number; text: string; kids: Item[] }
  const root: Item = { indent: -1, ordered: false, n: 1, text: "", kids: [] };
  const stack = [root];
  let last: Item | null = null;
  for (const l of lines.slice(first)) {
    const m = ITEM.exec(l);
    if (!m) {
      last!.text += ` ${l.trim()}`;
      continue;
    }
    const indent = m[1]!.length;
    while (stack.length > 1 && stack.at(-1)!.indent >= indent) stack.pop();
    if (last && indent > last.indent && last !== stack.at(-1)) stack.push(last);
    const item: Item = { indent, ordered: /\d/.test(m[2]!), n: Number.parseInt(m[2]!, 10) || 1, text: m[3]!, kids: [] };
    stack.at(-1)!.kids.push(item);
    last = item;
  }
  const html = (items: Item[]): string => {
    const ordered = items[0]!.ordered;
    const start = ordered && items[0]!.n !== 1 ? ` start="${items[0]!.n}"` : "";
    return `<${ordered ? "ol" : "ul"}${start}>${items.map((i) => `<li>${inline(escape(i.text), c.o)}${i.kids.length ? html(i.kids) : ""}</li>`).join("")}</${ordered ? "ol" : "ul"}>`;
  };
  const intro = lines.slice(0, first);
  return `${intro.length ? `<p>${inline(escape(intro.join(" ")), c.o)}</p>\n` : ""}${html(root.kids)}`;
}

/**
 * A list starting at src[i] whose items are apart (blank lines between them) or hold indented blocks
 * under them (code, tables, more paragraphs): one list, each item's content rendered as Markdown.
 * Null for a list without blank lines, which blocks() takes.
 */
function looseList(src: string, i: number, c: Ctx): { html: string; end: number } | null {
  const lines = src.slice(i).split("\n");
  const first = ITEM.exec(lines[0]!)!;
  const base = first[1]!.length,
    ordered = /\d/.test(first[2]!);
  const item = (l: string) => {
    const m = ITEM.exec(l);
    return m && m[1]!.length === base && /\d/.test(m[2]!) === ordered ? m : null;
  };
  let n = 1,
    loose = false;
  while (n < lines.length) {
    const l = lines[n]!;
    if (l === "") {
      let k = n + 1;
      while (lines[k] === "") k++;
      const next = lines[k];
      if (next === undefined || !(item(next) || /^ */.exec(next)![0].length > base)) break;
      loose = true;
      n = k;
    } else if (/^(```|<)/.test(l)) break;
    else n++;
  }
  if (!loose) return null;
  const items: { indent: number; lines: string[] }[] = [];
  for (const l of lines.slice(0, n)) {
    const m = item(l);
    if (m) items.push({ indent: m[0].length - m[3]!.length, lines: [m[3]!] });
    else {
      const it = items.at(-1)!;
      it.lines.push(l.slice(Math.min(it.indent, /^ */.exec(l)![0].length)));
    }
  }
  const html = items.map((it) => {
    const h = render(it.lines.join("\n"), c);
    return `<li>${!h.includes("\n") && h.startsWith("<p>") && h.indexOf("<p>", 1) < 0 ? h.slice(3, -4) : h}</li>`;
  });
  const start = ordered ? Number.parseInt(first[2]!, 10) : 1;
  const tag = ordered ? "ol" : "ul";
  return { html: `<${tag}${start !== 1 ? ` start="${start}"` : ""}>${html.join("")}</${tag}>`, end: Math.min(src.length, i + lines.slice(0, n).join("\n").length + 1) };
}

const ALERT = /^> ?\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\] *$/i;
const ALERT_KIND: Record<string, string> = { note: "note", tip: "tip", important: "info", warning: "warning", caution: "danger" };

/** Blank-line separated blocks: the core first, in its order, then what it would have left as text. */
function blocks(md: string, c: Ctx): string[] {
  const out: string[] = [];
  const anchor = escape(c.o.anchorLabel ?? "Link to this section");
  const slug = c.o.headingId ?? headingId;
  for (const block of md.split(/\n{2,}/)) {
    const lines = block.split("\n");
    const h = /^(#{1,3}) (.*)$/.exec(block);
    if (lines[0]!.startsWith("```") && lines.at(-1) === "```") out.push(`<pre><code>${escape(lines.slice(1, -1).join("\n"))}</code></pre>`);
    else if (isTable(lines)) {
      const [head, , ...rows] = lines.map(cells);
      const row = (tag: string, r: string[]) => `<tr>${r.map((x) => `<${tag}>${inline(escape(x), c.o)}</${tag}>`).join("")}</tr>`;
      out.push(`<div class="tbl"><table><thead>${row("th", head!)}</thead><tbody>${rows.map((r) => row("td", r!)).join("")}</tbody></table></div>`);
    } else if (lines.every((l) => l.startsWith(">"))) {
      const alert = ALERT.exec(lines[0]!);
      if (alert) {
        c.extended = true;
        out.push(callout(ALERT_KIND[alert[1]!.toLowerCase()]!, render(lines.slice(1).map((l) => l.replace(/^> ?/, "")).join("\n"), c)));
      } else out.push(`<blockquote class="callout">${inline(escape(lines.map((l) => l.replace(/^> ?/, "")).join(" ")), c.o)}</blockquote>`);
    } else if (lines.every((l) => /^\d+\. /.test(l))) {
      const n = Number.parseInt(lines[0]!, 10);
      out.push(`<ol${n !== 1 ? ` start="${n}"` : ""}>${lines.map((l) => `<li>${inline(escape(l.replace(/^\d+\. /, "")), c.o)}</li>`).join("")}</ol>`);
    } else if (h && lines.length === 1) {
      const n = h[1]!.length,
        id = escape(slug(h[2]!));
      out.push(n === 1 ? `<h1>${inline(escape(h[2]!), c.o)}</h1>` : `<h${n} id="${id}">${inline(escape(h[2]!), c.o)}<a class="hash" href="#${id}" aria-label="${anchor}">#</a></h${n}>`);
    } else if (lines.every((l) => l.startsWith("- "))) out.push(`<ul>${lines.map((l) => `<li>${inline(escape(l.slice(2)), c.o)}</li>`).join("")}</ul>`);
    else {
      // Beyond the core: the core printed each of these as a paragraph of the text as written.
      const deep = /^(#{4,6}) (.*)$/.exec(block);
      const lst = lines.some((l) => ITEM.test(l)) ? list(lines, c) : null;
      if (deep && lines.length === 1) {
        const n = deep[1]!.length,
          id = escape(slug(deep[2]!));
        out.push(`<h${n} id="${id}">${inline(escape(deep[2]!), c.o)}<a class="hash" href="#${id}" aria-label="${anchor}">#</a></h${n}>`);
      } else if (lines.length === 1 && /^ {0,3}([-*_])( *\1){2,} *$/.test(block)) out.push("<hr>");
      else if (lst) out.push(lst);
      else {
        out.push(`<p>${inline(escape(lines.join(" ")), c.o)}</p>`);
        continue;
      }
      c.extended = true;
    }
  }
  return out;
}

// ── Components and raw HTML ────────────────────────────────

type Attrs = Record<string, string | true>;
interface Tag {
  name: string;
  attrs: Attrs;
  /** Index just past the tag's `>`. */
  end: number;
  selfClosing: boolean;
}

/** Read `<Name a="x" b={2} c>` (across lines) starting at src[i] === "<". */
function readTag(src: string, i: number): Tag | null {
  const m = /^<([A-Za-z][A-Za-z0-9]*)/.exec(src.slice(i));
  if (!m) return null;
  const attrs: Attrs = {};
  let j = i + m[0].length;
  for (;;) {
    while (/\s/.test(src[j] ?? "")) j++;
    if (src.startsWith("/>", j)) return { name: m[1]!, attrs, end: j + 2, selfClosing: true };
    if (src[j] === ">") return { name: m[1]!, attrs, end: j + 1, selfClosing: false };
    const key = /^[A-Za-z_:][\w:.-]*/.exec(src.slice(j));
    if (!key) return null;
    j += key[0].length;
    while (src[j] === " ") j++;
    if (src[j] !== "=") {
      attrs[key[0]] = true;
      continue;
    }
    j++;
    while (src[j] === " ") j++;
    const q = src[j];
    if (q === '"' || q === "'") {
      const close = src.indexOf(q, j + 1);
      if (close < 0) return null;
      attrs[key[0]] = src.slice(j + 1, close);
      j = close + 1;
    } else if (q === "{") {
      let depth = 0,
        k = j;
      for (; k < src.length; k++) {
        if (src[k] === "{") depth++;
        else if (src[k] === "}" && --depth === 0) break;
      }
      if (k >= src.length) return null;
      attrs[key[0]] = src.slice(j + 1, k).trim();
      j = k + 1;
    } else return null;
  }
}

/** `"2"`, `2`, `{"x"}` → the string inside. */
const attr = (a: Attrs, k: string) => {
  const v = a[k];
  if (v === undefined || v === true) return v === true ? "true" : undefined;
  return v.replace(/^(["'`])([\s\S]*)\1$/, "$2");
};
const flag = (a: Attrs, k: string) => a[k] === true || attr(a, k) === "true";
const cols = (a: Attrs) => {
  const n = Number.parseInt(attr(a, "cols") ?? "2", 10);
  return Math.min(Math.max(Number.isFinite(n) ? n : 2, 1), 6);
};

/** A URL for href/src: anything but a script scheme. */
const safeUrl = (u: string) => (/^\s*(javascript|vbscript|data(?!:image\/))\s*:/i.test(u) ? "#" : u);

const UNITLESS = new Set(["opacity", "z-index", "flex", "flex-grow", "flex-shrink", "font-weight", "line-height", "order", "zoom"]);
/** `{{ maxHeight: "620px", gap: 12 }}` or `"max-height:620px"` → CSS text. */
function style(v: string): string {
  if (!v.startsWith("{")) return v;
  const parts: string[] = [];
  for (const m of v.matchAll(/([A-Za-z-]+)\s*:\s*(?:"([^"]*)"|'([^']*)'|(-?[\d.]+))/g)) {
    const prop = m[1]!.replace(/[A-Z]/g, (ch) => `-${ch.toLowerCase()}`);
    const val = m[2] ?? m[3] ?? (UNITLESS.has(prop) || m[4] === "0" ? m[4]! : `${m[4]}px`);
    parts.push(`${prop}:${val}`);
  }
  return parts.join(";");
}

const VOID = new Set(["img", "br", "hr", "source"]);
/** Block-level HTML taken on a line of its own (inline HTML other than <br> stays text). */
const HTML_TAGS = new Set([...VOID, "div", "video", "figure", "figcaption", "picture"]);
const HTML_ATTRS = new Set(["src", "srcset", "alt", "title", "width", "height", "loading", "href", "id", "controls", "autoplay", "muted", "loop", "playsinline", "poster", "type"]);

/** Raw HTML, with the attributes above, class/className and style (JSX objects become CSS). */
function htmlTag(t: Tag, body: string | null, c: Ctx): string {
  const out: string[] = [];
  for (const [k, v] of Object.entries(t.attrs)) {
    const key = k === "className" ? "class" : k;
    if (v === true) {
      if (HTML_ATTRS.has(key)) out.push(` ${key}`);
      continue;
    }
    const val = attr(t.attrs, k)!;
    if (key === "style") out.push(` style="${escape(style(val))}"`);
    else if (key === "class" || HTML_ATTRS.has(key)) out.push(` ${key}="${escape(key === "src" || key === "href" ? safeUrl(val) : val)}"`);
  }
  const open = `<${t.name}${out.join("")}>`;
  return VOID.has(t.name) ? open : `${open}${body ? render(body, c) : ""}</${t.name}>`;
}

const ICON = (d: string) =>
  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICONS: Record<string, string> = {
  note: ICON('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>'),
  info: ICON('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>'),
  tip: ICON('<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4"/>'),
  warning: ICON('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>'),
  danger: ICON('<path d="M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86z"/><path d="M12 8v4M12 16h.01"/>'),
  check: ICON('<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>'),
};
const chevron = (size = 16) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const callout = (kind: string, body: string) => `<div class="${kind === "note" ? "note" : `note ${kind}`}" role="note">${ICONS[kind]}<div>${body}</div></div>`;

/** A Mintlify component; `body` is its Markdown (dedented), null when self-closing. */
function component(t: Tag, body: string | null, c: Ctx): string {
  const a = t.attrs;
  const md = (s: string | null) => (s ? render(s, c) : "");
  const title = (k = "title") => inline(escape(attr(a, k) ?? ""), c.o);
  switch (t.name) {
    case "Note":
    case "Tip":
    case "Info":
    case "Warning":
    case "Check":
    case "Danger":
      return callout(t.name.toLowerCase(), md(body));
    case "Steps": {
      const outer = c.steps;
      c.steps = { n: 0 };
      const html = `<ol class="steps">${md(body)}</ol>`;
      c.steps = outer;
      return html;
    }
    case "Step": {
      if (!c.steps) {
        c.steps = { n: 0 };
        const html = `<ol class="steps">${component(t, body, c)}</ol>`;
        c.steps = undefined;
        return html;
      }
      const n = Number.parseInt(attr(a, "stepNumber") ?? "", 10) || ++c.steps.n;
      c.steps.n = n;
      return `<li class="step"><span class="step-n" aria-hidden="true">${n}</span><div class="step-t">${title()}</div>${body ? `<div class="step-b">${md(body)}</div>` : ""}</li>`;
    }
    case "AccordionGroup":
      return `<div class="accs">${md(body)}</div>`;
    case "Accordion":
    case "Expandable":
      return `<details class="acc"${flag(a, "defaultOpen") ? " open" : ""}><summary>${title()}${chevron()}</summary><div class="acc-b">${md(body)}</div></details>`;
    case "CardGroup":
      return `<div class="cards" style="--cols:${cols(a)}">${md(body)}</div>`;
    case "Columns":
      return `<div class="cols" style="--cols:${cols(a)}">${md(body)}</div>`;
    case "Card": {
      const href = attr(a, "href");
      const icon = attr(a, "icon") && c.o.icon?.(attr(a, "icon")!);
      const text = `${a.title ? `<span class="card-t">${title()}</span>` : ""}${body ? `<div class="card-b">${md(body)}</div>` : ""}`;
      // `horizontal`: the icon on the left, the text on its right. Laid out inline, so no stylesheet changes for it.
      const row = flag(a, "horizontal");
      const inner = row
        ? `${icon ? `<span class="card-i" style="margin:0">${icon}</span>` : ""}<span class="card-c" style="display:flex;flex-direction:column;gap:2px;min-width:0">${text}</span>`
        : `${icon ? `<span class="card-i">${icon}</span>` : ""}${text}`;
      const cls = row ? ' class="card card-h" style="flex-direction:row;align-items:center;gap:14px"' : ' class="card"';
      return href ? `<a${cls} href="${escape(safeUrl(href))}"${/^https?:/.test(href) ? ' target="_blank" rel="noopener"' : ""}>${inner}</a>` : `<div${cls}>${inner}</div>`;
    }
    case "Frame": {
      const caption = attr(a, "caption");
      return `<figure class="frame">${md(body)}${caption ? `<figcaption>${inline(escape(caption), c.o)}</figcaption>` : ""}</figure>`;
    }
    case "Tabs": {
      const outer = c.tabs;
      c.tabs = { name: `${c.o.idPrefix ?? "md"}-tabs-${++c.ids}`, n: 0 };
      const html = `<div class="tabs">${md(body)}</div>`;
      c.tabs = outer;
      return html;
    }
    case "CodeGroup": {
      // Each fence a tab, labelled with its title or language.
      const name = `${c.o.idPrefix ?? "md"}-tabs-${++c.ids}`;
      const codes = [...(body ?? "").matchAll(/^```([^\n]*)\n([\s\S]*?)\n?```[ \t]*$/gm)];
      return `<div class="tabs codes">${codes
        .map((m, k) => {
          const f = fenceInfo(m[1]!);
          const id = `${name}-${k + 1}`;
          return `<input type="radio" name="${name}" id="${id}"${k ? "" : " checked"}><label for="${id}">${escape(f.title || f.lang || "Code")}</label><div class="tab">${pre(m[2]!)}</div>`;
        })
        .join("")}</div>`;
    }
    case "Tab": {
      if (!c.tabs) return md(body);
      const id = `${c.tabs.name}-${++c.tabs.n}`;
      return `<input type="radio" name="${c.tabs.name}" id="${id}"${c.tabs.n === 1 ? " checked" : ""}><label for="${id}">${title()}</label><div class="tab">${md(body)}</div>`;
    }
    default:
      // An unknown component: keep what's inside.
      return md(body);
  }
}

/** Components that sit in a line of text (inline()), even at the start of one. */
const INLINE = new Set(["Icon", "Tooltip"]);
const COMPONENTS = new Set(["Steps", "Step", "AccordionGroup", "Accordion", "Expandable", "Note", "Tip", "Info", "Warning", "Check", "Danger", "CardGroup", "Card", "Columns", "Frame", "Tabs", "Tab", "CodeGroup"]);

/** A component or HTML element starting at src[i], to its closing tag (same-name tags nest). */
function element(src: string, i: number): { tag: Tag; body: string | null; end: number } | null {
  const t = readTag(src, i);
  if (!t) return null;
  const known = /^[A-Z]/.test(t.name) ? !INLINE.has(t.name) : HTML_TAGS.has(t.name);
  if (!known) return null;
  if (t.selfClosing || VOID.has(t.name)) return { tag: t, body: null, end: t.end };
  const re = new RegExp(`<(/?)${t.name}(?=[\\s/>])`, "g");
  re.lastIndex = t.end;
  let depth = 1;
  for (let m = re.exec(src); m; m = re.exec(src)) {
    if (m[1]) {
      if (--depth === 0) {
        const close = src.indexOf(">", m.index);
        return { tag: t, body: src.slice(t.end, m.index), end: close + 1 };
      }
    } else {
      const inner = readTag(src, m.index);
      if (inner && !inner.selfClosing) depth++;
      if (inner) re.lastIndex = inner.end;
    }
  }
  return null;
}

/** Remove the common indent; lines of only spaces become empty. */
function dedent(s: string): string {
  const lines = s.replace(/^[ \t]*\n/, "").replace(/\n[ \t]*$/, "").split("\n");
  const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => /^ */.exec(l)![0].length));
  return lines.map((l) => (l.trim() ? l.slice(Number.isFinite(indent) ? indent : 0) : "")).join("\n");
}

// ── Documents ──────────────────────────────────────────────

/** Split into fenced code, components/HTML and runs of plain Markdown; render each. */
function render(md: string, c: Ctx): string {
  const src = md.trim().replace(/^[ \t]+$/gm, "");
  const out: string[] = [];
  let text: string[] = [];
  const flush = () => {
    while (text.length && text[0] === "") text.shift();
    while (text.length && text.at(-1) === "") text.pop();
    if (text.length) out.push(...blocks(text.join("\n"), c));
    text = [];
  };
  let i = 0;
  while (i < src.length) {
    let eol = src.indexOf("\n", i);
    if (eol < 0) eol = src.length;
    const line = src.slice(i, eol);
    const lead = /^ */.exec(line)![0].length;
    // ```fences, blank lines and all (the core took them only without blank lines).
    if (line.startsWith("```")) {
      const close = src.slice(eol).search(/\n```[ \t]*(\n|$)/);
      if (close >= 0) {
        const body = src.slice(eol + 1, eol + close);
        const end = src.indexOf("\n", eol + close + 1);
        const next = end < 0 ? src.length : end;
        const blankAfter = next >= src.length || src[next + 1] === "\n";
        const startsBlock = text.length === 0 || text.at(-1) === "";
        const { title } = fenceInfo(line.slice(3));
        if (title || !(startsBlock && blankAfter && !body.includes("\n\n") && /^```$/.test(src.slice(eol + close + 1, next)))) c.extended = true;
        flush();
        out.push(pre(body, title));
        i = next + 1;
        continue;
      }
    }
    // MDX comments: {/* … */} and <!-- … -->, on their own lines.
    const comment = /^\s*(\{\/\*|<!--)/.test(line) && /^[ \t]*(\{\/\*[\s\S]*?\*\/\}|<!--[\s\S]*?-->)[ \t]*(\n|$)/.exec(src.slice(i));
    if (comment) {
      c.extended = true;
      i += comment[0].length;
      continue;
    }
    // A list with blank lines between its items or blocks under them (a tight one goes to blocks()).
    if (lead < 4 && (text.length === 0 || text.at(-1) === "") && ITEM.test(line)) {
      const l = looseList(src, i, c);
      if (l) {
        c.extended = true;
        flush();
        out.push(l.html);
        i = l.end;
        continue;
      }
    }
    if (line[lead] === "<") {
      const el = element(src, i + lead);
      if (el) {
        c.extended = true;
        flush();
        const body = el.body === null ? null : dedent(el.body);
        out.push(/^[A-Z]/.test(el.tag.name) ? component(el.tag, body, c) : htmlTag(el.tag, body, c));
        // Text after the closing tag on its line carries on as the next line.
        i = el.end;
        while (src[i] === " " || src[i] === "\t") i++;
        if (src[i] === "\n") i++;
        continue;
      }
    }
    if (line.includes("<Icon") || line.includes("<Tooltip")) c.extended = true;
    text.push(line);
    i = eol + 1;
  }
  flush();
  return out.join("\n");
}

/** Markdown to HTML. */
export function markdown(md: string, o: MarkdownOptions = {}): string {
  return renderMarkdown(md, o).html;
}

/** Markdown to HTML, and whether it used anything beyond the core (so the page needs DOCS_CSS.extra). */
export function renderMarkdown(md: string, o: MarkdownOptions = {}): Rendered {
  const c: Ctx = { o, extended: false, ids: 0 };
  const html = render(md, c);
  return { html, extended: c.extended };
}

/** YAML-style front matter (`key: value` lines between `---`), and the Markdown after it. */
export function frontMatter(md: string): { data: Record<string, string>; body: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(md);
  if (!m) return { data: {}, body: md };
  const data: Record<string, string> = {};
  for (const line of m[1]!.split(/\r?\n/)) {
    const kv = /^([\w-]+):\s*(.*)$/.exec(line);
    if (kv) data[kv[1]!] = kv[2]!.replace(/^(["'])(.*)\1$/, "$2");
  }
  return { data, body: md.slice(m[0].length) };
}

/** A page's description for search and link previews: its first paragraph as plain text, about `max` characters. */
export function lede(md: string, max = 160): string {
  const p = md.split(/\n{2,}/).find((b) => !/^(#|```|- |\d+\. |_|\||>|<|\{\/\*|---)/.test(b)) ?? "";
  const t = p.replace(/\n/g, " ").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[`*]/g, "").replace(/(^|\W)_([^_]+)_/g, "$1$2").trim();
  if (t.length <= max) return t;
  const end = t.lastIndexOf(". ", max - 1);
  return end >= 60 ? t.slice(0, end + 1) : `${t.slice(0, t.lastIndexOf(" ", max - 3))}…`;
}

// ── Around the article ─────────────────────────────────────

export interface DocLink {
  href: string;
  title: string;
}
export interface DocGroup {
  name: string;
  /** SVG markup shown before the name (svgIcon() in lib/docs-icons.ts), as Mintlify's group icons. */
  icon?: string;
  /** Pages, or a group inside the group (a folding sub-menu; `open` starts it open). */
  pages: (DocLink | (DocGroup & { open?: boolean }))[];
}

/** The side menu: each group's name, then its pages, with the current one marked. */
export function docMenu(groups: DocGroup[], current: string): string {
  const links = (pages: DocGroup["pages"]): string =>
    pages
      .map((x) =>
        "href" in x
          ? `<a href="${escape(x.href)}"${x.href === current ? ' aria-current="page"' : ""}>${escape(x.title)}</a>`
          : `<details class="dgrp"${x.open || inGroup(x, current) ? " open" : ""}><summary>${x.icon ?? ""}${escape(x.name)}${chevron()}</summary>${links(x.pages)}</details>`,
      )
      .join("");
  return groups.map((g) => `<b>${g.icon ?? ""}${escape(g.name)}</b>${links(g.pages)}`).join("");
}
const inGroup = (g: DocGroup, href: string): boolean => g.pages.some((x) => ("href" in x ? x.href === href : inGroup(x, href)));

/** Every page of the menu in order (for previous/next, sitemaps, llms.txt). */
export const menuPages = (groups: DocGroup[]): DocLink[] => {
  const flat = (pages: DocGroup["pages"]): DocLink[] => pages.flatMap((x) => ("href" in x ? [x] : flat(x.pages)));
  return groups.flatMap((g) => flat(g.pages));
};

/** "On this page": a link to each `##` heading (outside code); `headingId` as given to renderMarkdown(). */
export function tocLinks(md: string, o: Pick<MarkdownOptions, "headingId"> = {}): string {
  const prose = md.replace(/^```[^\n]*\n[\s\S]*?\n```[ \t]*$/gm, "");
  return [...prose.matchAll(/^## (.+)$/gm)].map((m) => `<a href="#${escape((o.headingId ?? headingId)(m[1]!))}">${inline(escape(m[1]!))}</a>`).join("");
}

/** Previous and next page cards. */
export const prevNext = (prev: DocLink | undefined, next: DocLink | undefined, labels = { prev: "Previous", next: "Next" }) =>
  `<div class="pn">${prev ? `<a href="${escape(prev.href)}"><span>${escape(labels.prev)}</span><b>${escape(prev.title)}</b></a>` : ""}${next ? `<a class="next" href="${escape(next.href)}"><span>${escape(labels.next)}</span><b>${escape(next.title)}</b></a>` : ""}</div>`;

/** "Last updated" under the title. */
export const updatedLine = (day: string, label = "Last updated") => `<p class="upd">${escape(label)} <time datetime="${escape(day)}">${escape(day)}</time></p>`;

/** Copy the page's Markdown, or open it in Claude or ChatGPT with `prompt`. Needs DOCS_SCRIPT. */
export function askRow(o: { markdownUrl: string; prompt: string; labels?: { copy: string; claude: string; chatgpt: string } }): string {
  const q = encodeURIComponent(o.prompt);
  const l = o.labels ?? { copy: "Copy page", claude: "Open in Claude", chatgpt: "Open in ChatGPT" };
  return `<div class="ask"><button type="button" data-copy-md="${escape(o.markdownUrl)}">${escape(l.copy)}</button><a href="https://claude.ai/new?q=${q}" target="_blank" rel="noopener">${escape(l.claude)}</a><a href="https://chatgpt.com/?q=${q}" target="_blank" rel="noopener">${escape(l.chatgpt)}</a></div>`;
}

/** Put `row` right after the article's first paragraph (the lede under the title). */
export const afterLede = (html: string, row: string) => {
  const i = html.indexOf("</p>");
  return i < 0 ? row + html : html.slice(0, i + 4) + row + html.slice(i + 4);
};

/**
 * The docs page: the menu (folded into one row on phones), the article and "On this page".
 * `article` is the inside of <article class="doc">: the rendered Markdown and anything after it.
 */
export function docsLayout(o: { menu: string; title: string; article: string; toc: string; label?: string; tocLabel?: string }): string {
  const label = escape(o.label ?? "Docs");
  return (
    `<div class="docs">` +
    `<details class="dnav-m"><summary><span>${label}</span><b>${escape(o.title)}</b>${chevron(14)}</summary><nav aria-label="${label}">${o.menu}</nav></details>` +
    `<nav class="dnav" aria-label="${label}">${o.menu}</nav>` +
    `<article class="doc">${o.article}</article>` +
    `${o.toc ? `<aside class="toc" aria-label="${escape(o.tocLabel ?? "On this page")}"><b>${escape(o.tocLabel ?? "On this page")}</b>${o.toc}</aside>` : ""}</div>`
  );
}

/**
 * The page script: a copy button on each code block, "Copy page" (data-copy-md), and the "On this
 * page" rail following the section being read. The only script a docs page needs. `labels` for a
 * page in another language (the code button's tooltip and label, and what "Copy page" says once done).
 */
export const docsScript = (labels: { copy?: string; copyCode?: string; copied?: string } = {}) => {
  const l = { copy: "Copy", copyCode: "Copy this command", copied: "Copied", ...labels };
  const js = (v: string) => JSON.stringify(v).replace(/</g, "\\u003c");
  return `<script>
const ICONS='<svg class="cp" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><svg class="ok" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
document.querySelectorAll(".doc pre").forEach(p=>{const b=document.createElement("button");b.type="button";b.className="cpy";b.title=${js(l.copy)};b.setAttribute("aria-label",${js(l.copyCode)});b.innerHTML=ICONS;b.dataset.copyCode="";p.appendChild(b)});
const done=b=>{if(b.classList.contains("cpy")){b.classList.add("done");return setTimeout(()=>b.classList.remove("done"),1500)}const l=b.textContent;b.textContent=${js(l.copied)};setTimeout(()=>b.textContent=l,1500)};
document.addEventListener("click",async e=>{
  const c=e.target.closest("[data-copy-code]");
  if(c){await navigator.clipboard.writeText(c.parentElement.querySelector("code").textContent);return done(c)}
  const b=e.target.closest("[data-copy-md]");
  if(b){await navigator.clipboard.writeText(await (await fetch(b.dataset.copyMd)).text());done(b)}
});
const links=[...document.querySelectorAll(".toc a")];
if(links.length){const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting)links.forEach(l=>l.classList.toggle("on",l.getAttribute("href")==="#"+en.target.id))}),{rootMargin:"-80px 0px -70% 0px"});document.querySelectorAll(".doc h2[id]").forEach(h=>io.observe(h))}
</script>`;
};
/** docsScript() in English. */
export const DOCS_SCRIPT = docsScript();

// ── Search ─────────────────────────────────────────────────

/** One entry of the search index: [address with #section, page title, section heading ("" for the top), plain text]. */
export type SearchEntry = [href: string, page: string, heading: string, text: string];

/** A page's Markdown/MDX as plain text: components' titles kept (Step, Accordion, Card), tags, images and Markdown marks dropped. */
export function plainText(md: string): string {
  return md
    .replace(/\{\/\*[\s\S]*?\*\/\}|<!--[\s\S]*?-->/g, " ")
    .replace(/^```[^\n]*$/gm, " ")
    .replace(/<[A-Za-z][^>]*?\stitle=(["'])(.*?)\1[^>]*>/g, " $2 ")
    .replace(/<\/?[A-Za-z][^>]*>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^\s*(#{1,6}|>|[-*+]|\d+[.)])\s+/gm, "")
    .replace(/^\|?[\s:|-]+\|?$/gm, " ")
    .replace(/\*\*|__|`/g, "")
    .replace(/\|/g, " ")
    .replace(/(^|\W)_([^_]+)_(?=\W|$)/g, "$1$2")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * The search index for docsSearch(): each page cut at its `##` and `###` headings, so a result opens
 * at its section. Serve it as JSON (`JSON.stringify(searchIndex(pages))`) next to the pages; the
 * script fetches it the first time search opens. `headingId` as given to renderMarkdown().
 */
export function searchIndex(pages: { href: string; title: string; md: string }[], o: Pick<MarkdownOptions, "headingId"> = {}): SearchEntry[] {
  const id = o.headingId ?? headingId;
  const out: SearchEntry[] = [];
  for (const p of pages) {
    const prose = p.md.replace(/^```[^\n]*\n[\s\S]*?\n```[ \t]*$/gm, (code) => code.replace(/^#/gm, " #"));
    const parts = prose.split(/^(#{2,3} .+)$/m);
    out.push([p.href, p.title, "", plainText(parts[0]!)]);
    for (let i = 1; i < parts.length; i += 2) {
      const heading = parts[i]!.replace(/^#+ /, "").trim();
      out.push([`${p.href}#${id(heading)}`, p.title, plainText(heading), plainText(parts[i + 1] ?? "")]);
    }
  }
  return out;
}

const SEARCH_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`;

/**
 * Search over the pages, with no service behind it: a button for the header (it shrinks to an icon
 * on phones), a dialog, and a small script that fetches `index` (searchIndex() as JSON) on first
 * open. Ctrl K / ⌘K or "/" opens it; ↑ ↓ Enter pick a result; Esc closes. Matching is by parts of
 * words in any language (every word typed must appear; spaces don't matter, so 프레임관리 finds
 * 프레임 관리), titles and headings first. Styles: DOCS_CSS.search.
 */
export function docsSearch(o: { index: string; labels?: { button?: string; placeholder?: string; empty?: string; close?: string } }): { button: string; dialog: string } {
  const l = { button: "Search", placeholder: "Search the docs", empty: "No results", close: "Close", ...o.labels };
  const js = (v: string) => JSON.stringify(v).replace(/</g, "\\u003c");
  const button = `<button type="button" class="srch-b" data-search-open aria-haspopup="dialog">${SEARCH_ICON}<span>${escape(l.button)}</span><kbd>⌘K</kbd></button>`;
  const dialog =
    `<dialog class="srch" aria-label="${escape(l.button)}"><div class="srch-in">${SEARCH_ICON}<input type="search" placeholder="${escape(l.placeholder)}" autocomplete="off" spellcheck="false" aria-controls="srch-r"><button type="button" data-search-close>${escape(l.close)}</button></div><ul id="srch-r" role="listbox"></ul></dialog>` +
    `<script>(()=>{const d=document.querySelector("dialog.srch"),q=d.querySelector("input"),ul=d.querySelector("ul"),E=${js(l.empty)};let ix,sel=0,hits=[];
const esc=s=>s.replace(/[&<>"]/g,c=>"&#"+c.charCodeAt(0)+";"),norm=s=>s.toLowerCase(),flat=s=>s.replace(/\\s+/g,"");
const load=()=>ix||(ix=fetch(${js(o.index)}).then(r=>r.json()).then(a=>a.map(e=>{const h=norm(e[1]+" "+e[2]+" "+e[3]);return{e,h,f:flat(h),t:flat(norm(e[1])),s:flat(norm(e[2]))}})).catch(()=>(ix=null,[])));
const has=(x,w)=>x.h.includes(w)||x.f.includes(w);
const snip=(t,ws)=>{const lt=norm(t);let i=-1;for(const w of ws){i=lt.indexOf(w);if(i>=0)break}const a=Math.max(0,i-40),s=(a?"…":"")+t.slice(a,a+140)+(t.length>a+140?"…":"");let h=esc(s);for(const w of ws)if(w)h=h.replace(new RegExp(esc(w).replace(/[.*+?^\${}()|[\\]\\\\]/g,"\\\\$&"),"gi"),m=>"<mark>"+m+"</mark>");return h};
const show=()=>{[...ul.children].forEach((li,i)=>li.setAttribute("aria-selected",i===sel));ul.children[sel]?.scrollIntoView({block:"nearest"})};
const run=async()=>{const v=norm(q.value.trim());if(!v){ul.innerHTML="";hits=[];return}const ws=v.split(/\\s+/),all=await load();if(v!==norm(q.value.trim()))return;
hits=all.filter(x=>ws.every(w=>has(x,w))).map(x=>({x,r:ws.reduce((n,w)=>n+(x.t.includes(w)?4:0)+(x.s.includes(w)?2:0),0)+(x.t===flat(v)||x.s===flat(v)?8:0)+(x.e[2]?0:1)})).sort((a,b)=>b.r-a.r).slice(0,20).map(h=>h.x);
sel=0;ul.innerHTML=hits.length?hits.map((x,i)=>'<li role="option"><a href="'+esc(x.e[0])+'"><b>'+esc(x.e[2]||x.e[1])+'</b>'+(x.e[2]?'<span>'+esc(x.e[1])+'</span>':"")+'<p>'+snip(x.e[3]||x.e[2],ws)+'</p></a></li>').join(""):'<li class="srch-0">'+esc(E)+'</li>';show()};
const open=()=>{if(!d.open){d.showModal();q.select();load()}};
document.addEventListener("keydown",e=>{if((e.key==="k"||e.key==="K")&&(e.metaKey||e.ctrlKey)||e.key==="/"&&!/input|textarea|select/i.test(document.activeElement.tagName)&&!document.activeElement.isContentEditable){e.preventDefault();open()}});
document.addEventListener("click",e=>{if(e.target.closest("[data-search-open]"))open();else if(e.target===d||e.target.closest("[data-search-close]"))d.close();else if(e.target.closest("dialog.srch a"))d.close()});
q.addEventListener("input",run);
q.addEventListener("keydown",e=>{if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();if(hits.length){sel=(sel+(e.key==="ArrowDown"?1:hits.length-1))%hits.length;show()}}else if(e.key==="Enter"&&hits[sel]){e.preventDefault();d.close();location.href=hits[sel].e[0]}});
})()</script>`;
  return { button, dialog };
}

// ── For agents ─────────────────────────────────────────────

/** llms.txt (llmstxt.org): a title, a one-paragraph summary, then sections of links. */
export const llmsTxt = (o: { name: string; summary: string; sections: { name: string; links: { title: string; url: string }[] }[] }) =>
  `# ${o.name}\n\n> ${o.summary}\n\n${o.sections.map((s) => `## ${s.name}\n\n${s.links.map((l) => `- [${l.title}](${l.url})`).join("\n")}`).join("\n\n")}\n`;

/** llms-full.txt: every page's Markdown in one file, each under its address. */
export const llmsFullTxt = (o: { title: string; intro: string; pages: { url: string; updated?: string; md: string }[] }) =>
  `# ${o.title}\n\n${o.intro}\n\n${o.pages.map((p) => `Source: ${p.url}\n${p.updated ? `Last updated: ${p.updated}\n` : ""}\n${p.md.trim()}`).join("\n\n---\n\n")}\n`;
