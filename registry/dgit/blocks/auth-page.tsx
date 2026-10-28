import type { ComponentProps, ReactNode, Ref } from "react";
import { cn } from "@/lib/utils";

/**
 * Sign-in screens: no card, one centered 384px column, a 30px title, 40px pill choices stacked
 * (email, passkey, Google, GitHub), a code field or code boxes, and "Signing in to <app>" at the top
 * right when another app sent the person here. For the whole email → code / password / Google flow, use
 * the `auth-flow` block, which is built on these.
 *
 *   <AuthLayout brand={<Logo />} app="Claude">
 *     <AuthTitle>Log into your account</AuthTitle>
 *     <AuthButton icon={<Mail />}>Continue with email</AuthButton>
 *     <AuthDivider />
 *     <AuthButton icon={<KeyRound />}>Continue with passkey</AuthButton>
 *   </AuthLayout>
 */
export function AuthLayout({ brand, app, footer, children, align = "center" }: { brand?: ReactNode; app?: string; footer?: ReactNode; children: ReactNode; align?: "center" | "left" }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="flex items-center justify-between gap-3 px-4 py-[14px] sm:px-6 sm:py-[18px]">
        {brand ?? <span />}
        {app ? (
          <div className="flex min-w-0 items-center gap-2 text-sm whitespace-nowrap text-muted-foreground">
            <span className="hidden sm:inline">Signing in to</span>
            <b className="max-w-[220px] truncate rounded-full border px-3 py-[5px] font-medium text-foreground">{app}</b>
          </div>
        ) : null}
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-4 pt-6 pb-14">
        <div className={cn("flex w-full max-w-[384px] flex-col gap-3", align === "left" && "[&_h1]:text-left [&>p.sub]:text-left")}>{children}</div>
      </main>
      {footer ? <footer className="px-4 py-5 text-center text-xs text-muted-foreground [&_a]:text-inherit">{footer}</footer> : null}
    </div>
  );
}

export function AuthTitle({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <>
      <h1 className="mb-5 text-center text-heading-30 text-balance">{children}</h1>
      {sub ? <p className="sub -mt-4 mb-4 text-center text-muted-foreground text-balance [&_b]:font-medium [&_b]:text-foreground">{sub}</p> : null}
    </>
  );
}

const pill =
  "flex h-10 w-full cursor-pointer items-center justify-center gap-2.5 rounded-full border px-4 text-[15px] leading-none font-medium no-underline transition-[background,opacity] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:cursor-default disabled:opacity-50 [&_svg]:size-[18px]";

/** A full-width pill: outline by default, `primary` for the one main action. */
export function AuthButton({ icon, primary, className, children, ...props }: ComponentProps<"button"> & { icon?: ReactNode; primary?: boolean }) {
  return (
    <button className={cn(pill, primary ? "border-primary bg-primary text-primary-foreground hover:opacity-88" : "bg-transparent text-foreground hover:bg-gray-100", className)} {...props}>
      {icon}
      {children}
    </button>
  );
}

/** A pill text field (email and the like). */
export function AuthField({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-full border bg-transparent px-[18px] text-[15px] text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground",
        className,
      )}
      {...props}
    />
  );
}

/** A one-time code field: 52px tall, monospace, spaced out. */
export function AuthCodeField({ className, ...props }: ComponentProps<"input">) {
  return (
    <AuthField
      inputMode="numeric"
      autoComplete="one-time-code"
      className={cn("h-[52px] pl-[calc(18px+0.45em)] text-center font-mono text-[22px] font-medium tracking-[0.45em]", className)}
      {...props}
    />
  );
}

/**
 * A one-time code as boxes: two joined groups with a dash between (6 → 3·3, 8 → 4·4). One real input sits
 * over the boxes, so typing, paste (a full "123 456" replaces what's there), backspace and the phone's
 * `one-time-code` autofill all behave like a normal field. The box to type into gets the focus ring; `bad` turns the boxes red.
 * `fill` stretches the boxes so the row spans its container (e.g. as wide as the Continue button under it);
 * the dash between the groups keeps its size.
 *
 *   <AuthCodeBoxes value={code} onChange={setCode} label="6-digit code" bad={Boolean(error)} />
 */
export function AuthCodeBoxes({
  value,
  onChange,
  length = 6,
  numeric = true,
  bad = false,
  fill = false,
  label,
  inputRef,
  className,
  ...props
}: Omit<ComponentProps<"input">, "value" | "onChange" | "ref"> & {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  /** Digits only (default). Off: letters and digits, upper-cased. */
  numeric?: boolean;
  bad?: boolean;
  /** Stretch the boxes to the container's full width (height stays 36px). */
  fill?: boolean;
  /** The field's accessible name ("6-digit code"). */
  label: string;
  inputRef?: Ref<HTMLInputElement>;
}) {
  const clean = (raw: string) => (numeric ? raw.replace(/\D/g, "") : raw.replace(/[^0-9a-z]/gi, "").toUpperCase()).slice(0, length);
  const active = Math.min(value.length, length - 1);
  const half = Math.ceil(length / 2);
  const caretToEnd = (el: HTMLInputElement) => {
    const end = el.value.length;
    if (el.selectionStart !== end || el.selectionEnd !== end) el.setSelectionRange(end, end);
  };
  // `fill`: equal grid columns, so every box is the same width whatever its borders.
  const cols = (n: number) => ({ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` });
  const box = (i: number) => (
    <div
      key={i}
      className={cn(
        "relative flex h-9 items-center justify-center border-y border-r border-input bg-background-200 text-sm leading-5 text-foreground shadow-xs first:rounded-l-[8px] first:border-l last:rounded-r-[8px]",
        !fill && "w-9",
        i === active && "group-focus-within:z-10 group-focus-within:ring-2 group-focus-within:ring-ring",
        bad && "border-destructive",
      )}
    >
      {value[i] ?? ""}
    </div>
  );
  return (
    <div className={cn("group relative items-center gap-2", fill ? "flex w-full" : "inline-flex", className)}>
      <div className={cn("flex", fill && "grid flex-1")} style={fill ? cols(half) : undefined} aria-hidden="true">
        {Array.from({ length: half }, (_, i) => box(i))}
      </div>
      <div className="flex size-6 shrink-0 items-center justify-center" aria-hidden="true">
        <span className="h-0.5 w-4 bg-foreground opacity-20" />
      </div>
      <div className={cn("flex", fill && "grid flex-1")} style={fill ? cols(length - half) : undefined} aria-hidden="true">
        {Array.from({ length: length - half }, (_, i) => box(half + i))}
      </div>
      <input
        {...props}
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(clean(e.target.value))}
        // The caret always sits at the end, so a paste would only append: a full code ("123 456") replaces
        // the value, a shorter piece is added to it.
        onPaste={(e) => {
          e.preventDefault();
          const pasted = clean(e.clipboardData.getData("text"));
          if (pasted) onChange(pasted.length >= length ? pasted : clean(value + pasted));
        }}
        onSelect={(e) => caretToEnd(e.currentTarget)}
        onFocus={(e) => caretToEnd(e.currentTarget)}
        inputMode={numeric ? "numeric" : "text"}
        autoComplete="one-time-code"
        autoCapitalize={numeric ? "off" : "characters"}
        autoCorrect="off"
        spellCheck={false}
        aria-label={label}
        aria-invalid={bad || undefined}
        className="absolute inset-0 size-full cursor-text border-0 bg-transparent p-0 text-base text-transparent caret-transparent outline-none selection:bg-transparent"
      />
    </div>
  );
}

export function AuthDivider({ children = "or", className }: { children?: ReactNode; className?: string }) {
  return (
    <div className={cn("my-1 flex items-center gap-3 text-[13px] text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border", className)}>
      {children}
    </div>
  );
}

/** Small muted text under the form ("The code expires in 5 minutes."). */
export function AuthNote({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("mt-1 text-center text-[13px] text-muted-foreground [&_a]:text-foreground", className)}>{children}</p>;
}
