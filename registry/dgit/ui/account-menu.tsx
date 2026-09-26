import { useId, type ReactNode } from "react";
import { LogOut, Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type ThemeChoice } from "@/registry/dgit/lib/theme";
import { Menu, MenuItem, MenuLabel, MenuSeparator } from "@/registry/dgit/ui/menu";
import { cn } from "@/lib/utils";

export interface AccountMenuItem {
  label: string;
  icon?: ReactNode;
  href?: string;
  external?: boolean;
  onSelect?: () => void;
}

/**
 * The signed-in person's menu: who they are, a theme switch, your links, and sign out.
 * Open it from an avatar in a header (`side="below" align="end"`) or from the bottom of a
 * sidebar (`side="above"`).
 */
export function AccountMenu({
  name,
  email,
  items = [],
  onSignOut,
  side = "below",
  align = "end",
  labels = {},
  trigger,
}: {
  name: string;
  email?: string;
  items?: AccountMenuItem[];
  onSignOut: () => void;
  side?: "below" | "above";
  align?: "start" | "end";
  labels?: { theme?: string; signOut?: string; system?: string; light?: string; dark?: string };
  /** Defaults to AccountButton. */
  trigger?: (props: { open: boolean; toggle: () => void }) => ReactNode;
}) {
  const [theme, setTheme] = useTheme();
  return (
    <Menu
      side={side}
      align={align}
      label="Account"
      className="w-72"
      trigger={trigger ?? ((p) => <AccountButton name={name} open={p.open} onClick={p.toggle} />)}
    >
      {({ close }) => (
        <>
          <MenuLabel>
            <div className="truncate text-label-14 font-medium text-foreground">{name}</div>
            {email && email !== name ? <div className="truncate text-copy-13 text-gray-900">{email}</div> : null}
          </MenuLabel>
          <MenuSeparator />
          <div className="flex h-9 items-center justify-between px-2">
            <span className="text-label-14">{labels.theme ?? "Theme"}</span>
            <ThemeSwitch value={theme} onChange={setTheme} labels={labels} />
          </div>
          {items.map((it) => (
            <MenuItem
              key={it.label}
              icon={it.icon}
              href={it.href}
              external={it.external}
              onSelect={() => {
                close();
                it.onSelect?.();
              }}
            >
              {it.label}
            </MenuItem>
          ))}
          <MenuSeparator />
          <MenuItem
            icon={<LogOut />}
            onSelect={() => {
              close();
              onSignOut();
            }}
          >
            {labels.signOut ?? "Log out"}
          </MenuItem>
        </>
      )}
    </Menu>
  );
}

/** A round initial (or image) that opens the account menu. */
export function AccountButton({ name, image, open, onClick, className }: { name: string; image?: string; open?: boolean; onClick?: () => void; className?: string }) {
  const initial = (name.trim()[0] ?? "?").toUpperCase();
  return (
    <button
      type="button"
      aria-label={`Account: ${name}`}
      aria-expanded={open}
      aria-haspopup="menu"
      onClick={onClick}
      className={cn(
        "grid size-8 cursor-pointer place-content-center overflow-hidden rounded-full border-0 bg-gray-1000 text-label-13 font-medium text-background transition-shadow outline-none",
        "hover:shadow-[0_0_0_4px_var(--dgit-gray-alpha-200)] focus-visible:shadow-[0_0_0_2px_var(--background),0_0_0_4px_var(--ring)]",
        open && "shadow-[0_0_0_4px_var(--dgit-gray-alpha-200)]",
        className,
      )}
    >
      {image ? <img src={image} alt="" className="size-full object-cover" /> : initial}
    </button>
  );
}

/** System / light / dark as three small round buttons. */
export function ThemeSwitch({
  value,
  onChange,
  labels = {},
}: {
  value: ThemeChoice;
  onChange: (next: ThemeChoice) => void;
  labels?: { system?: string; light?: string; dark?: string };
}) {
  const id = useId();
  const options = [
    { value: "system" as const, label: labels.system ?? "System", Icon: Monitor },
    { value: "light" as const, label: labels.light ?? "Light", Icon: Sun },
    { value: "dark" as const, label: labels.dark ?? "Dark", Icon: Moon },
  ];
  return (
    <fieldset className="m-0 flex h-6 w-fit rounded-full border-0 p-0 shadow-[0_0_0_1px_var(--dgit-gray-alpha-300)]">
      <legend className="sr-only">Theme</legend>
      {options.map(({ value: v, label, Icon }) => (
        <span key={v} className="h-full">
          <input id={`${id}-${v}`} className="peer sr-only" type="radio" name={id} value={v} checked={value === v} aria-label={label} onChange={() => onChange(v)} />
          <label
            htmlFor={`${id}-${v}`}
            title={label}
            className={cn(
              "relative m-0 grid size-6 cursor-pointer place-content-center rounded-full text-gray-600 hover:text-gray-900",
              "peer-checked:bg-background peer-checked:text-foreground peer-checked:shadow-[0_0_0_1px_var(--dgit-gray-alpha-400)]",
              "peer-focus-visible:shadow-[0_0_0_2px_var(--ring)]",
            )}
          >
            <Icon className="size-3" />
          </label>
        </span>
      ))}
    </fieldset>
  );
}
