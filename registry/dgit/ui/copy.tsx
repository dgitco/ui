import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/registry/dgit/ui/button";
import { cn } from "@/lib/utils";

export function CopyButton({ text, label = "Copy", className }: { text: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={cn("text-muted-foreground hover:text-foreground", className)}
      aria-label={copied ? "Copied" : label}
      title={copied ? "Copied" : label}
      onClick={() => navigator.clipboard.writeText(text).then(() => setCopied(true))}
    >
      {copied ? <Check /> : <Copy />}
    </Button>
  );
}

/** A monospace value (URL, command, token) with a copy button. */
export function CopyField({ value, multiline, className }: { value: string; multiline?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-start gap-2 rounded-2xl border bg-muted/40 py-1.5 pr-1.5 pl-4", className)}>
      <pre className={cn("min-w-0 flex-1 py-1 font-mono text-[13px] leading-6", multiline ? "whitespace-pre-wrap [overflow-wrap:anywhere]" : "truncate")}>{value}</pre>
      <CopyButton text={value} />
    </div>
  );
}
