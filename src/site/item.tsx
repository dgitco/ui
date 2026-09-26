import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { cn } from "@/lib/utils";
import { Code } from "~/site/code";
import { ITEMS, itemByName, pathOf } from "~/site/items";
import { NotFound } from "~/site/not-found";

interface RegistryFile {
  path: string;
  content: string;
}

/** What `shadcn add` delivers: the built registry item, fetched from /r/<name>.json. */
function useSource(name: string) {
  const [files, setFiles] = useState<RegistryFile[] | null>(null);
  useEffect(() => {
    setFiles(null);
    fetch(`/r/${name}.json`)
      .then((r) => r.json() as Promise<{ files: RegistryFile[] }>)
      .then((j) => setFiles(j.files))
      .catch(() => setFiles([]));
  }, [name]);
  return files;
}

export function ItemPage() {
  const { name } = useParams();
  const item = itemByName(name);
  const files = useSource(name ?? "");
  const [tab, setTab] = useState<"preview" | "code">("preview");
  if (!item) return <NotFound />;
  return (
    <div className="mx-auto flex max-w-6xl gap-10 px-4 py-10 sm:px-6">
      <aside className="sticky top-24 hidden h-fit w-48 flex-none flex-col gap-6 lg:flex">
        {(["foundation", "component", "block"] as const).map((kind) => (
          <div key={kind} className="flex flex-col gap-1">
            <div className="mb-1 px-2 text-label-12 font-medium text-muted-foreground">{kind === "foundation" ? "Foundations" : kind === "component" ? "Components" : "Blocks"}</div>
            {ITEMS.filter((i) => i.kind === kind).map((i) => (
              <Link
                key={i.name}
                to={pathOf(i)}
                className={cn("rounded-md px-2 py-1.5 text-label-14 no-underline", i.name === item.name ? "bg-gray-100 font-medium text-foreground" : "text-muted-foreground hover:text-foreground")}
              >
                {i.title}
              </Link>
            ))}
          </div>
        ))}
      </aside>
      <article className="min-w-0 flex-1">
        <div className="mb-1 text-label-13 text-muted-foreground">{item.kind === "block" ? "Block" : item.kind === "foundation" ? "Foundation" : "Component"}</div>
        <h1 className="text-heading-30 mb-2">{item.title}</h1>
        <p className="mb-8 max-w-2xl text-muted-foreground text-pretty">{item.summary}</p>

        <div className="mb-3 flex gap-1" role="tablist">
          {(["preview", "code"] as const).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => setTab(t)} className={cn("cursor-pointer rounded-full border-0 px-3.5 py-1.5 text-sm font-medium capitalize", tab === t ? "bg-accent text-foreground" : "bg-transparent text-muted-foreground hover:text-foreground")}>
              {t}
            </button>
          ))}
        </div>
        {tab === "preview" ? (
          <div
            className={cn(
              "relative overflow-hidden rounded-2xl border bg-background",
              item.frame ? "[&>div]:h-full [&>div]:min-h-full! [&>div]:w-full" : "flex min-h-[320px] items-center justify-center p-10",
              !item.frame && "bg-[radial-gradient(var(--color-gray-alpha-300)_1px,transparent_1px)] [background-size:16px_16px]",
            )}
            style={item.frame ? { height: item.frame } : undefined}
          >
            {item.preview()}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {files === null ? <div className="text-copy-14 text-muted-foreground">Loading…</div> : files.map((f) => <Code key={f.path} title={f.path} code={f.content} />)}
          </div>
        )}

        <h2 className="text-heading-20 mt-12 mb-3">Install</h2>
        <Code code={`npx shadcn add @dgit/${item.name}`} />
        <p className="mt-2 text-copy-13 text-muted-foreground">
          First time? Add the registry to <code className="font-mono">components.json</code>: see <Link to="/docs" className="text-foreground underline underline-offset-2">Docs</Link>.
        </p>

        <h2 className="text-heading-20 mt-10 mb-3">Usage</h2>
        <Code code={item.usage} />
      </article>
    </div>
  );
}
