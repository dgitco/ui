import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Sign-in screens: no card, one centered 384px column, a 30px title, 40px pill choices stacked
 * (email, passkey, Google, GitHub), and "Signing in to <app>" at the top right when another app
 * sent the person here.
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

export function AuthDivider({ children = "or" }: { children?: ReactNode }) {
  return (
    <div className="my-1 flex items-center gap-3 text-[13px] text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
      {children}
    </div>
  );
}

/** Small muted text under the form ("The code expires in 5 minutes."). */
export function AuthNote({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("mt-1 text-center text-[13px] text-muted-foreground [&_a]:text-foreground", className)}>{children}</p>;
}
