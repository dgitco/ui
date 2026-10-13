// Writes registry/dgit/styles/docs.css from registry/dgit/lib/docs-css.ts, so the docs item ships
// one set of rules two ways: strings for HTML built in code, a file for projects that import CSS.
// Run by `bun run registry`.
import { writeFileSync } from "node:fs";
import { DOCS_CSS } from "../registry/dgit/lib/docs-css";

const { tokens, focus, content, layout, extra, search } = DOCS_CSS;
const css = `/*
 * DGit UI docs: the styles for the HTML lib/docs.ts writes (a docs site: side menu, article, "On
 * this page", and the Mintlify-style components). Import it after the theme:
 *
 *   @import "tailwindcss";
 *   @import "./dgit.css";
 *   @import "./docs.css";
 *
 * Generated from lib/docs-css.ts (scripts/docs-css.ts in dgitco/ui); edit that file. The narrow
 * single-article look (DOCS_CSS.article) is only in lib/docs-css.ts.
 */

/* The docs' color names, from the DGit theme. Inside .doc and .docs, --muted and --card are the
   docs' secondary text and fill colors, not shadcn's. */${tokens}
/* Focus ring, reduced motion */${focus}
/* Tables, notes, "Last updated", call to action */${content}
/* Docs layout: side menu, article, "On this page", ask row, previous/next */${layout}
/* Beyond the core: h4–h6, rules, images, nested lists, components, menu groups */${extra}
/* Search: docsSearch()'s button and dialog */${search}`;
writeFileSync("registry/dgit/styles/docs.css", css);
