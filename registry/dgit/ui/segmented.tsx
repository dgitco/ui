import { cn } from "@/lib/utils";

/** Two or three choices as one small pill; the chosen one is filled. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  disabled,
  label,
  className,
}: {
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (next: T) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex w-fit rounded-full border p-0.5 text-xs", className)} role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          disabled={disabled}
          onClick={() => onChange(o.value)}
          className={cn(
            "cursor-pointer rounded-full px-2.5 py-1 transition-colors disabled:cursor-default",
            value === o.value ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
