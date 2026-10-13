/*
 * DGit UI docs styles, as strings: `<style>${DOCS_CSS.content}</style>` in pages built as HTML
 * strings (a Worker, a static generator). docs.css has the same rules as a file, for projects that
 * import CSS; scripts/docs-css.ts writes it from this one.
 *
 * Every rule hangs off the classes lib/docs.ts writes (.doc, .docs, .dnav, .toc, .pn, .ask…) and
 * reads these colors: --fg (text), --bg (page), --line (hairlines), --muted (secondary text), --card
 * and --card2 (fills), --hover, --dim (link underlines), --ok, --warn, --warn-bg. A page that defines
 * them (0bridge does) uses the sections as they are; on the DGit theme add `tokens` first.
 *
 * The look: monochrome, 1px hairlines, 14px corners, no shadows, light and dark from the colors.
 * Each section starts and ends with a newline, so `<style>${…}</style>` reads one rule a line.
 */

/**
 * The colors above from the DGit theme (dgit.css): --fg is foreground, --bg background, --line
 * border, --muted muted-foreground, --card secondary (gray-100), --card2 gray-200, --hover accent,
 * --dim gray-500; --ok, --warn and --warn-bg are the theme's own. Inside .doc and .docs, --muted
 * and --card are the docs' text and fill colors, not shadcn's. Lists get back the markers
 * Tailwind's reset takes away.
 */
const tokens = `
.doc,.docs{--fg:var(--foreground);--bg:var(--background);--line:var(--border);--muted:var(--muted-foreground);--card:var(--secondary);--card2:hsla(var(--dgit-gray-200),1);--hover:var(--accent);--dim:hsla(var(--dgit-gray-500),1)}
.doc ul{list-style:disc}.doc ol{list-style:decimal}
`;

/** One visible focus ring for keyboard users, and no smooth scrolling or long transitions when motion is reduced. */
const focus = `
a:focus-visible,button:focus-visible,summary:focus-visible,[tabindex]:focus-visible{outline:2px solid var(--fg);outline-offset:2px;border-radius:6px}
@media (prefers-reduced-motion:reduce){*,::before,::after{scroll-behavior:auto!important;transition-duration:.01ms!important}}
`;

/** Tables (scrolling sideways on their own, never the page), `>` notes, the "Last updated" line and a closing call to action. */
const content = `
.doc .tbl{margin:0 0 18px;overflow-x:auto;border:1px solid var(--line);border-radius:14px}
.doc table{width:100%;border-collapse:collapse;font-size:14px;line-height:1.5}
.doc th,.doc td{padding:10px 14px;text-align:left;vertical-align:top;border-bottom:1px solid var(--line)}
.doc th{font-weight:500;color:var(--muted);font-size:13px;white-space:nowrap}
.doc tbody tr:last-child td{border-bottom:0}
.doc td:first-child{font-weight:500}
.doc blockquote.callout{margin:0 0 16px;padding:12px 16px;border-radius:14px;background:var(--card);color:var(--fg);font-size:15px;line-height:1.6}
.doc blockquote.callout code{background:var(--bg)}
.doc .upd{margin:0 0 12px;font-size:13px;color:var(--muted)}
.doc .cta{margin:40px 0 0;padding:20px 22px;border-radius:14px;background:var(--card)}.doc .cta p{margin:0 0 10px}
.doc .cta a.pill{display:inline-flex;align-items:center;height:36px;padding:0 18px;border-radius:999px;background:var(--fg);color:var(--bg);text-decoration:none;font-weight:500;font-size:14px}
`;

/** A single article in a narrow column (policies, support pages, comparisons): 15px text, bordered code. */
const article = `
.doc{line-height:1.65;font-size:15px}
.doc h1{text-align:left;margin:0 0 4px}
.doc h2{font-size:18px;font-weight:600;letter-spacing:-.2px;margin:32px 0 8px}
.doc p,.doc ul{margin:0 0 12px}.doc ul{padding-left:20px}.doc li{margin:4px 0}
.doc a{color:inherit}.doc code{font:500 13px "Geist Mono",ui-monospace,monospace}
.doc > p:first-of-type{color:var(--muted);margin-bottom:24px}
.doc pre{margin:0 0 16px;padding:12px 16px;border:1px solid var(--line);border-radius:14px;overflow-x:auto}.doc pre code{font-size:13px;line-height:1.6;background:none;padding:0;border-radius:0}
.doc ol{margin:0 0 12px;padding-left:22px}
.doc a.hash{margin-left:8px;color:var(--muted);text-decoration:none;opacity:0}.doc h2:hover a.hash,.doc h3:hover a.hash{opacity:1}
`;

/**
 * A docs site: the side menu by group, the article, an "On this page" rail on wide screens, the ask
 * row, previous/next; on phones the menu folds into one row. 16px text, filled code with a copy button.
 */
const layout = `
.docs{display:grid;grid-template-columns:200px minmax(0,1fr) 180px;gap:48px;align-items:start;padding-top:24px}
.dnav,.toc{position:sticky;top:84px;display:flex;flex-direction:column;font-size:14px}
.dnav b,.toc b{font-size:12px;font-weight:500;color:var(--muted);padding:0 10px 6px}
.dnav b:not(:first-child){margin-top:18px}
.dnav a{padding:6px 10px;border-radius:8px;color:var(--muted);text-decoration:none}
.dnav a:hover,.toc a:hover{color:var(--fg)}.dnav a[aria-current]{background:var(--card);color:var(--fg);font-weight:500}
.toc a{padding:4px 10px;color:var(--muted);text-decoration:none;font-size:13px;border-left:1px solid var(--line)}
.toc a.on{color:var(--fg);border-left-color:var(--fg)}
.dnav-m{display:none}
.doc{min-width:0;line-height:1.7;font-size:16px}
.doc h1{margin:0 0 12px;text-align:left;font-size:40px;font-weight:500;letter-spacing:-.03em;line-height:1.1}
.doc>p:first-of-type{color:var(--muted);font-size:18px;line-height:1.55;margin-bottom:20px}
.doc h2{font-size:24px;font-weight:500;letter-spacing:-.02em;line-height:1.3;margin:48px 0 12px;scroll-margin-top:88px}
.doc h3{font-size:17px;font-weight:500;margin:28px 0 8px;scroll-margin-top:88px}
.doc h2 a.hash,.doc h3 a.hash{margin-left:8px;color:var(--muted);text-decoration:none;opacity:0;transition:opacity .15s}
.doc h2:hover a.hash,.doc h3:hover a.hash,.doc a.hash:focus-visible{opacity:1}
.doc p,.doc ul,.doc ol{margin:0 0 14px}.doc ul,.doc ol{padding-left:22px}.doc li{margin:6px 0}
.doc li::marker{color:var(--muted)}
.doc a{color:inherit;text-underline-offset:3px;text-decoration-color:var(--dim)}.doc a:hover{text-decoration-color:var(--fg)}
.doc code{font:500 13.5px "Geist Mono",ui-monospace,monospace;background:var(--card);padding:2px 6px;border-radius:6px;overflow-wrap:anywhere}
.doc pre{position:relative;margin:0 0 18px;padding:16px 64px 16px 18px;border:0;border-radius:14px;background:var(--card);overflow-x:auto}
.doc pre code{font-size:13.5px;line-height:1.65;background:none;padding:0;border-radius:0;overflow-wrap:normal}
.doc pre .cpy{position:absolute;top:10px;right:10px;width:32px;height:32px;padding:0;display:grid;place-items:center;border-radius:9px;border:1px solid var(--line);background:var(--bg);color:var(--muted);cursor:pointer;transition:color .15s,background .15s}
.copybtn:hover,.cpy:hover{background:var(--hover);color:var(--fg)} .copybtn .ok,.cpy .ok{display:none} .copybtn.done .cp,.cpy.done .cp{display:none} .copybtn.done .ok,.cpy.done .ok{display:block;color:var(--ok)}
.ask{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 36px;padding-bottom:28px;border-bottom:1px solid var(--line)}
.ask a,.ask button{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 12px;border:1px solid var(--line);border-radius:999px;background:none;color:var(--fg);font-family:inherit;font-size:13px;font-weight:500;line-height:1;text-decoration:none;cursor:pointer}
.ask a:hover,.ask button:hover{background:var(--hover)}
.pn{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:56px}
.pn a{display:flex;flex-direction:column;gap:2px;padding:16px 18px;border-radius:14px;background:var(--card);text-decoration:none;transition:background .15s}
.pn a:hover{background:var(--card2)} .pn a.next{text-align:right;grid-column:2}
.pn span{font-size:12px;color:var(--muted)} .pn b{font-weight:500}
@media (max-width:1100px){.docs{grid-template-columns:190px minmax(0,1fr)}.toc{display:none}}
@media (max-width:820px){
.docs{grid-template-columns:minmax(0,1fr);gap:0;padding:0 8px}
.dnav{display:none}
.dnav-m{display:block;margin:0 -8px 24px;border-radius:14px;background:var(--card)}
.dnav-m summary{display:flex;align-items:center;justify-content:space-between;gap:8px;height:46px;padding:0 16px;list-style:none;cursor:pointer;font-size:15px}
.dnav-m summary::-webkit-details-marker{display:none}
.dnav-m summary span{color:var(--muted);font-size:13px}.dnav-m summary b{font-weight:500;margin-right:auto}
.dnav-m summary svg{transition:transform .2s}.dnav-m[open] summary svg{transform:rotate(180deg)}
.dnav-m nav{display:flex;flex-direction:column;padding:0 8px 10px;font-size:15px;max-height:60vh;overflow:auto}
.dnav-m nav b{font-size:12px;font-weight:500;color:var(--muted);padding:12px 10px 4px}
.dnav-m nav a{padding:10px;border-radius:8px;color:var(--muted);text-decoration:none}
.dnav-m nav a[aria-current]{background:var(--card2);color:var(--fg);font-weight:500}
.doc h1{font-size:32px}.doc>p:first-of-type{font-size:17px}.doc h2{font-size:21px;margin-top:40px}
.pn{grid-template-columns:1fr}.pn a.next{grid-column:auto}
}
`;

/**
 * What goes beyond the core (renderMarkdown() says when a page used it): h4–h6, rules, images,
 * nested and loose lists, code titles, and the components: callouts, steps, accordions, cards,
 * columns, frames, tabs, code groups, icons, tooltips, and folding groups in the side menu.
 */
const extra = `
.doc h4,.doc h5,.doc h6{font-size:15px;font-weight:600;margin:24px 0 6px;scroll-margin-top:88px}
.doc h4 a.hash,.doc h5 a.hash,.doc h6 a.hash{margin-left:8px;color:var(--muted);text-decoration:none;opacity:0}.doc h4:hover a.hash,.doc h5:hover a.hash,.doc h6:hover a.hash{opacity:1}
.doc hr{margin:32px 0;border:0;border-top:1px solid var(--line)}
.doc img{max-width:100%;height:auto}
.doc li>ul,.doc li>ol{margin:4px 0 0}
.doc li>p,.doc li>pre,.doc li>.tbl{margin:8px 0}.doc li>:first-child{margin-top:0}.doc li>:last-child{margin-bottom:0}
.doc pre[data-title]{position:relative;padding-top:50px}
.doc pre[data-title]::before{content:attr(data-title);position:absolute;top:0;left:0;right:0;padding:9px 18px;border-bottom:1px solid var(--line);font:500 12.5px/1.5 "Geist Mono",ui-monospace,monospace;color:var(--muted);white-space:nowrap}
.doc .ic{display:inline-flex;vertical-align:-.125em}.doc .ic svg{width:1em;height:1em}
.doc .tt{text-decoration:underline dotted var(--dim);text-underline-offset:3px;cursor:help}
.doc .note{display:flex;gap:12px;margin:0 0 16px;padding:12px 16px;border-radius:14px;background:var(--card);font-size:15px;line-height:1.6}
.doc .note>svg{flex:none;margin-top:4px;color:var(--muted)}
.doc .note>div{flex:1;min-width:0}.doc .note>div>:last-child{margin-bottom:0}.doc .note code{background:var(--bg)}
.doc .note.warning,.doc .note.danger{background:var(--warn-bg)}.doc .note.warning>svg,.doc .note.danger>svg{color:var(--warn)}.doc .note.check>svg{color:var(--ok)}
.doc .steps{list-style:none;margin:0 0 18px;padding:0}
.doc .step{position:relative;margin:0;padding:0 0 24px 44px}
.doc .step::before{content:"";position:absolute;left:13px;top:34px;bottom:6px;width:1px;background:var(--line)}
.doc .step:last-child{padding-bottom:4px}.doc .step:last-child::before{display:none}
.doc .step-n{position:absolute;left:0;top:0;display:grid;place-items:center;width:27px;height:27px;border:1px solid var(--line);border-radius:999px;background:var(--bg);font:500 13px/1 "Geist Mono",ui-monospace,monospace}
.doc .step-t{padding-top:1px;margin-bottom:8px;font-weight:500;line-height:1.55}
.doc .step-b>:last-child{margin-bottom:0}
.doc .acc,.doc .accs{margin:0 0 12px;border:1px solid var(--line);border-radius:14px}.doc .accs{margin-bottom:18px}
.doc .accs>.acc{margin:0;border:0;border-radius:0}.doc .accs>.acc+.acc{border-top:1px solid var(--line)}
.doc .acc summary{display:flex;align-items:center;gap:12px;padding:12px 16px;font-weight:500;line-height:1.5;list-style:none;cursor:pointer}
.doc .acc summary::-webkit-details-marker{display:none}
.doc .acc summary svg{flex:none;margin-left:auto;color:var(--muted);transition:transform .2s}.doc .acc summary:hover svg{color:var(--fg)}.doc .acc[open]>summary svg{transform:rotate(180deg)}
.doc .acc-b{padding:0 16px 14px}.doc .acc-b>:last-child{margin-bottom:0}
.doc .cards,.doc .cols{display:grid;grid-template-columns:repeat(var(--cols,2),minmax(0,1fr));gap:12px;margin:0 0 18px}
.doc .cols{gap:16px;align-items:start}.doc .cols>*{margin:0}
.doc .card{display:flex;flex-direction:column;gap:4px;margin:0 0 12px;padding:16px 18px;border:1px solid var(--line);border-radius:14px;color:inherit;text-decoration:none;transition:background .15s}
.doc .cards>.card{margin:0}.doc a.card:hover{background:var(--hover)}
.doc .card-i{display:flex;margin-bottom:6px}.doc .card-i svg{width:20px;height:20px}
.doc .card-t{font-weight:500;line-height:1.4}
.doc .card-b{color:var(--muted);font-size:14px;line-height:1.55}.doc .card-b p{margin:0 0 8px}.doc .card-b>:last-child{margin-bottom:0}
.doc .frame{margin:0 0 18px;padding:8px;border:1px solid var(--line);border-radius:14px}.doc .frame>p{margin:0}
.doc .frame img,.doc .frame video{display:block;max-width:100%;height:auto;margin:0 auto;border-radius:8px}
.doc .frame figcaption{padding:8px 8px 2px;text-align:center;font-size:13px;line-height:1.5;color:var(--muted)}
.doc .tabs{position:relative;display:flex;flex-wrap:wrap;margin:0 0 18px;border:1px solid var(--line);border-radius:14px}
.doc .tabs>input{position:absolute;opacity:0;pointer-events:none}
.doc .tabs>label{padding:10px 14px;margin-bottom:-1px;border-bottom:1px solid transparent;color:var(--muted);font-size:14px;font-weight:500;cursor:pointer}
.doc .tabs>label:hover,.doc .tabs>input:checked+label{color:var(--fg)}.doc .tabs>input:checked+label{border-bottom-color:var(--fg)}
.doc .tabs>input:focus-visible+label{outline:2px solid var(--fg);outline-offset:-4px;border-radius:10px}
.doc .tab{display:none;order:1;width:100%;padding:16px 18px;border-top:1px solid var(--line)}.doc .tab>:last-child{margin-bottom:0}
.doc .tabs>input:checked+label+.tab{display:block}
.doc .codes{background:var(--card)}.doc .codes>.tab{padding:0}.doc .codes pre{margin:0;border-radius:0 0 13px 13px}
.dgrp summary{display:flex;align-items:center;justify-content:space-between;padding:6px 10px;border-radius:8px;color:var(--muted);list-style:none;cursor:pointer}
.dgrp summary::-webkit-details-marker{display:none}
.dgrp summary:hover{color:var(--fg)}.dgrp summary svg{transition:transform .2s}.dgrp[open]>summary svg{transform:rotate(180deg)}
.dnav .dgrp>a,.dnav-m .dgrp>a{display:block;padding-left:22px}
@media (max-width:640px){.doc .cards,.doc .cols{grid-template-columns:minmax(0,1fr)}}
`;

export const DOCS_CSS = { tokens, focus, content, article, layout, extra };

/** A docs site's styles in one <style>: focus, content, layout and extra, with the DGit color names first when `tokens`. */
export const docsStyle = (o: { tokens?: boolean } = {}) => `<style>${o.tokens ? tokens : ""}${focus}${content}${layout}${extra}</style>`;
