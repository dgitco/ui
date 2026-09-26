import { CopyButton } from "@/registry/dgit/ui/copy";
import { cn } from "@/lib/utils";

/** A code sample with a copy button. */
export function Code({ code, className, title }: { code: string; className?: string; title?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-xl border bg-background-200", className)}>
      {title ? <div className="flex items-center justify-between border-b px-4 py-2 font-mono text-label-12 text-muted-foreground">{title}</div> : null}
      <div className="relative">
        <pre className="max-h-[480px] overflow-auto px-4 py-3.5 pr-12 font-mono text-[13px] leading-6">{code}</pre>
        <CopyButton text={code} className="absolute top-2 right-2" />
      </div>
    </div>
  );
}
