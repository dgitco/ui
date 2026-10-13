// The docs item (registry/dgit/lib/docs.ts, docs-icons.ts): the core as 0bridge prints it, what it
// adds, and Mintlify's components as the Photoito guide writes them. `bun test`.
import { expect, test } from "bun:test";
import { DOCS_CSS, docsStyle } from "../registry/dgit/lib/docs-css";
import { docMenu, docsLayout, frontMatter, inline, lede, llmsTxt, markdown, menuPages, renderMarkdown, tocLinks } from "../registry/dgit/lib/docs";
import { FA_TO_LUCIDE, docIcons, lucideExport, lucideIcons, svgIcon } from "../registry/dgit/lib/docs-icons";
import * as lucide from "lucide";

test("core: headings, lists, tables, notes and code, as 0bridge prints them", () => {
  const md = "# Title\n\nLede with `code`, **bold**, _it_ and [a link](/docs).\n\n## Over SSH\n\n- one\n- two\n\n1. first\n2. second\n\n> Check the date.\n> It moves.\n\n```sh\n0b setup\n```\n\n| Client | Level |\n|---|---|\n| `Claude` | Full |\n| A \\| B | <b> |";
  const r = renderMarkdown(md);
  expect(r.extended).toBe(false);
  expect(r.html).toBe(
    [
      "<h1>Title</h1>",
      '<p>Lede with <code>code</code>, <b>bold</b>, <i>it</i> and <a href="/docs">a link</a>.</p>',
      '<h2 id="over-ssh">Over SSH<a class="hash" href="#over-ssh" aria-label="Link to this section">#</a></h2>',
      "<ul><li>one</li><li>two</li></ul>",
      "<ol><li>first</li><li>second</li></ol>",
      '<blockquote class="callout">Check the date. It moves.</blockquote>',
      "<pre><code>0b setup</code></pre>",
      '<div class="tbl"><table><thead><tr><th>Client</th><th>Level</th></tr></thead><tbody><tr><td><code>Claude</code></td><td>Full</td></tr><tr><td>A | B</td><td>&#60;b&#62;</td></tr></tbody></table></div>',
    ].join("\n"),
  );
  // not a table without the separator row
  expect(markdown("| a | b |\n| c | d |")).not.toContain("<table>");
});

test("anchors and relative pages link; a list split by code keeps its numbers", () => {
  expect(markdown("See [Setup](#setup) and [next](./next).")).toBe('<p>See <a href="#setup">Setup</a> and <a href="./next">next</a>.</p>');
  expect(markdown("1. one\n2. two\n\n```\nx\n```\n\n3. third")).toBe('<ol><li>one</li><li>two</li></ol>\n<pre><code>x</code></pre>\n<ol start="3"><li>third</li></ol>');
  expect(markdown("[x](javascript:alert(1))")).not.toContain("<a");
});

test("added: fences with blank lines, deep headings, rules, images, nested lists", () => {
  const r = renderMarkdown("```js\na\n\nb\n```\n\n#### Deep\n\n---\n\n![A cat](/cat.png \"Cat\")\n\nIntro:\n- a\n  - a1\n  - a2\n- b\n\n* star\n* list");
  expect(r.extended).toBe(true);
  expect(r.html).toBe(
    [
      "<pre><code>a\n\nb</code></pre>",
      '<h4 id="deep">Deep<a class="hash" href="#deep" aria-label="Link to this section">#</a></h4>',
      "<hr>",
      '<p><img src="/cat.png" alt="A cat" title="Cat" loading="lazy"></p>',
      "<p>Intro:</p>\n<ul><li>a<ul><li>a1</li><li>a2</li></ul></li><li>b</li></ul>",
      "<ul><li>star</li><li>list</li></ul>",
    ].join("\n"),
  );
  expect(inline("one&#60;br /&#62;two")).toBe("one<br>two");
  expect(markdown("> [!WARNING]\n> Back up first.")).toContain('<div class="note warning" role="note">');
});

test("Mintlify components as the Photoito guide writes them", () => {
  const md = `<Steps>
  <Step title="「필터 추가」를 눌러요">
    화면 오른쪽 위에 있어요.

    <Frame>
      <img src="/images/add.png" alt="버튼" style={{ maxHeight: "620px" }} />
    </Frame>

    | 이름 | 하는 일 |
    | --- | --- |
    | sharpen | 또렷하게 |
  </Step>

  <Step title="저장해요" />
</Steps>

<AccordionGroup>
  <Accordion title="알림이 오지 않아요">
    1. 알림이 켜져 있는지 확인해요.
    2. [문의](/support)해 주세요.
  </Accordion>
</AccordionGroup>

<CardGroup cols={2}>
  <Card title="설치 준비하기" icon="gear" href="/install/prepare">
    설치비 안내예요.
  </Card>
</CardGroup>

<Frame caption="두 화면">
  <div style={{ display: "flex", gap: "12px" }}>
    <img src="/a.png" alt="a" style={{ width: "50%" }} />
  </div>
</Frame>

<Tip>
  **처음에는** 두 개만 올려 보세요.
</Tip>`;
  const r = renderMarkdown(md, { icon: (n) => (n === "gear" ? "<svg data-gear></svg>" : undefined) });
  const h = r.html;
  expect(r.extended).toBe(true);
  expect(h).not.toContain("&#60;");
  expect(h).toContain('<ol class="steps"><li class="step"><span class="step-n" aria-hidden="true">1</span><div class="step-t">「필터 추가」를 눌러요</div><div class="step-b"><p>화면 오른쪽 위에 있어요.</p>');
  expect(h).toContain('<figure class="frame"><img src="/images/add.png" alt="버튼" style="max-height:620px"></figure>');
  expect(h).toContain("<td>sharpen</td>");
  expect(h).toContain('<li class="step"><span class="step-n" aria-hidden="true">2</span><div class="step-t">저장해요</div></li></ol>');
  expect(h).toContain('<div class="accs"><details class="acc"><summary>알림이 오지 않아요<svg');
  expect(h).toContain('<ol><li>알림이 켜져 있는지 확인해요.</li><li><a href="/support">문의</a>해 주세요.</li></ol>');
  expect(h).toContain('<div class="cards" style="--cols:2"><a class="card" href="/install/prepare"><span class="card-i"><svg data-gear></svg></span><span class="card-t">설치 준비하기</span><div class="card-b"><p>설치비 안내예요.</p></div></a></div>');
  expect(h).toContain('<figure class="frame"><div style="display:flex;gap:12px"><img src="/a.png" alt="a" style="width:50%"></div><figcaption>두 화면</figcaption></figure>');
  expect(h).toContain('<div class="note tip" role="note">');
  expect(h).toContain("<p><b>처음에는</b> 두 개만 올려 보세요.</p>");
});

test("tabs are radio buttons, one group per <Tabs>, ids from idPrefix", () => {
  const h = markdown('<Tabs>\n  <Tab title="Mac">\n    `brew`\n  </Tab>\n  <Tab title="Linux">\n    `apt`\n  </Tab>\n</Tabs>', { idPrefix: "p1" });
  expect(h).toBe(
    '<div class="tabs"><input type="radio" name="p1-tabs-1" id="p1-tabs-1-1" checked><label for="p1-tabs-1-1">Mac</label><div class="tab"><p><code>brew</code></p></div>\n<input type="radio" name="p1-tabs-1" id="p1-tabs-1-2"><label for="p1-tabs-1-2">Linux</label><div class="tab"><p><code>apt</code></p></div></div>',
  );
});

test("raw HTML keeps safe attributes only", () => {
  expect(markdown('<img src="javascript:x" alt="a" onerror="x()" />')).toBe('<img src="#" alt="a">');
  expect(markdown('<Card title="T" href="javascript:x">b</Card>')).toContain('<a class="card" href="#">');
  expect(markdown("<Note>one line</Note>")).toMatch(/^<div class="note" role="note"><svg [^]*<\/svg><div><p>one line<\/p><\/div><\/div>$/);
});

test("front matter, lede, On this page, menu, llms.txt", () => {
  const { data, body } = frontMatter('---\ntitle: "필터 관리"\ndescription: 보정\n---\n\nText.');
  expect(data).toEqual({ title: "필터 관리", description: "보정" });
  expect(body).toBe("\nText.");
  expect(lede("# T\n\n<Note>x</Note>\n\nThe [first](/x) _real_ paragraph.")).toBe("The first real paragraph.");
  expect(tocLinks("## One\n\n```md\n## Not a heading\n```\n\n## Two `x`")).toBe('<a href="#one">One</a><a href="#two-x">Two <code>x</code></a>');
  const groups = [{ name: "Start", pages: [{ href: "/a", title: "A" }, { name: "More", pages: [{ href: "/b", title: "B & C" }] }] }];
  expect(docMenu(groups, "/b")).toBe(
    '<b>Start</b><a href="/a">A</a><details class="dgrp" open><summary>More<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></summary><a href="/b" aria-current="page">B &#38; C</a></details>',
  );
  expect(menuPages(groups).map((p) => p.href)).toEqual(["/a", "/b"]);
  expect(docsLayout({ menu: "M", title: "T", article: "A", toc: "" })).toContain('<article class="doc">A</article></div>');
  expect(llmsTxt({ name: "X", summary: "S", sections: [{ name: "Docs", links: [{ title: "A", url: "https://x/a.md" }] }] })).toBe("# X\n\n> S\n\n## Docs\n\n- [A](https://x/a.md)\n");
});

test("lists with blank lines between items or blocks under them are one list", () => {
  const r = renderMarkdown("1. Make the webhook:\n\n   ```\n   0b webhook add\n   ```\n\n2. Paste the token.\n\n   | a | b |\n   | --- | --- |\n   | 1 | 2 |\n\n3. Done.\n\nAfter.");
  expect(r.extended).toBe(true);
  expect(r.html).toBe(
    '<ol><li><p>Make the webhook:</p>\n<pre><code>0b webhook add</code></pre></li><li><p>Paste the token.</p>\n<div class="tbl"><table><thead><tr><th>a</th><th>b</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr></tbody></table></div></li><li>Done.</li></ol>\n<p>After.</p>',
  );
  expect(markdown("- a\n\n- b\n- c")).toBe("<ul><li>a</li><li>b</li><li>c</li></ul>");
  expect(markdown("4. four\n\n5. five")).toBe('<ol start="4"><li>four</li><li>five</li></ol>');
  // a tight list is the core's, as before
  expect(renderMarkdown("- a\n- b\n\nText.").extended).toBe(false);
});

test("text after a closing tag on the same line is kept", () => {
  expect(markdown("<Note>Saved.</Note> Then reload.\nIt takes a second.")).toMatch(/<\/div><\/div>\n<p>Then reload. It takes a second.<\/p>$/);
  expect(markdown('<img src="/a.png" alt="a" /> The kiosk.')).toBe('<img src="/a.png" alt="a">\n<p>The kiosk.</p>');
});

test("code: titles, CodeGroup tabs", () => {
  expect(renderMarkdown("```python sync.py\nprint(1)\n```")).toEqual({ html: '<pre data-title="sync.py"><code>print(1)</code></pre>', extended: true });
  expect(renderMarkdown("```python\nprint(1)\n```")).toEqual({ html: "<pre><code>print(1)</code></pre>", extended: false });
  expect(markdown("<CodeGroup>\n```bash npm\nnpm i x\n```\n\n```sh\nbun add x\n```\n</CodeGroup>", { idPrefix: "g" })).toBe(
    '<div class="tabs codes"><input type="radio" name="g-tabs-1" id="g-tabs-1-1" checked><label for="g-tabs-1-1">npm</label><div class="tab"><pre><code>npm i x</code></pre></div><input type="radio" name="g-tabs-1" id="g-tabs-1-2"><label for="g-tabs-1-2">sh</label><div class="tab"><pre><code>bun add x</code></pre></div></div>',
  );
});

test("Icon and Tooltip in a line of text; code stays code", () => {
  const icon = (n: string) => (n === "gear" ? "<svg/>" : undefined);
  const r = renderMarkdown('<Icon icon="gear" size={20} /> Press <Tooltip tip="It\'s the cog">Settings</Tooltip>, not `<Icon icon="gear" />`. <Icon icon="nope" />', { icon });
  expect(r.extended).toBe(true);
  expect(r.html).toBe('<p><span class="ic" style="font-size:20px"><svg/></span> Press <span class="tt" title="It&#39;s the cog" tabindex="0">Settings</span>, not <code>&#60;Icon icon=&#34;gear&#34; /&#62;</code>. </p>');
  expect(markdown('<Tooltip tip="Docs" href="/docs">API</Tooltip>')).toBe('<p><a class="tt" href="/docs" title="Docs">API</a></p>');
});

test("lucide icons by Font Awesome or lucide name", () => {
  expect(svgIcon([["path", { d: "M1 1" }]], { size: 20 })).toBe(
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 1"/></svg>',
  );
  const icon = lucideIcons({ Settings: lucide.Settings, House: lucide.House });
  expect(icon("gear")).toBe(svgIcon(lucide.Settings));
  expect(icon("house")).toBe(svgIcon(lucide.House));
  expect(icon("receipt")).toBeUndefined();
  expect(lucideExport("rotate-ccw-clock")).toBe("RotateCcwClock");
  expect(docIcons('<Card icon="gear" /><Card icon="clock-rotate-left"></Card><Icon icon="house" />')).toEqual(["House", "RotateCcwClock", "Settings"]);
  // every name in the table is a lucide icon
  for (const [fa, name] of Object.entries(FA_TO_LUCIDE)) expect((lucide as Record<string, unknown>)[lucideExport(name)], `${fa} → ${name}`).toBeDefined();
});

test("styles: sections are one rule a line between newlines; docsStyle puts them together", () => {
  for (const [k, v] of Object.entries(DOCS_CSS)) {
    expect(v.startsWith("\n") && v.endsWith("\n")).toBe(true);
    expect(v.split("{").length, k).toBe(v.split("}").length);
  }
  expect(docsStyle({ tokens: true })).toStartWith("<style>\n.doc,.docs{--fg:var(--foreground)");
});
