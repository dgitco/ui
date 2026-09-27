import { useEffect, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, ChevronsUpDown, Menu as MenuIcon, Search, X } from "lucide-react";
import { Menu, MenuSeparator } from "@/registry/dgit/ui/menu";
import { cn } from "@/lib/utils";

/**
 * A dashboard with a sidebar instead of top pills, for apps with more places than fit in a row.
 *
 * - The sidebar has a root list; a **group** in it drills in: the sidebar slides over to that
 *   group's own list, with a back row on top. Groups are nav-only (no page of their own) and
 *   open their first child.
 * - A **layer** does the same for a place in the URL (inside a project: its Overview, Secrets,
 *   Settings…). While `layer` is set the sidebar shows it; its back row goes to `layer.back.to`.
 * - The top bar has a slot on the left (a `ScopeSwitcher` for the project you're in), breadcrumbs
 *   in the middle, and a slot on the right. Pages don't need their own big title.
 * - 256px, fixed from `md` up; below that a menu button opens it as a drawer.
 *
 * Routing stays yours: pass `pathname`, and `link` to render your router's links.
 *
 *   <SidebarLayout pathname={pathname} link={(p) => <Link to={p.to} {...p} />}
 *     brand={<Logo />} nav={NAV} layer={project ? projectLayer(project) : null}
 *     top={{ left: <ScopeSwitcher … />, crumbs }} footer={<AccountMenu side="above" align="start" … />}>
 *     <Outlet />
 *   </SidebarLayout>
 */

export interface NavLeaf {
  key: string;
  label: string;
  to: string;
  icon?: ReactNode;
  /** A link out of the app (docs, the home page): opens as a plain link, never active. */
  external?: boolean;
}
export interface NavGroup {
  key: string;
  label: string;
  icon?: ReactNode;
  children: NavLeaf[];
}
/** A small muted title between rows, or (`label` omitted) a hairline. */
export interface NavHeading {
  key: string;
  heading: true;
  label?: string;
}
export type NavItem = NavLeaf | NavGroup | NavHeading;

export interface NavLayer {
  key: string;
  /** Shown in the back row, e.g. the project's name. */
  title: string;
  back: { label: string; to: string };
  /** Above the list, e.g. a status line. */
  header?: ReactNode;
  items: NavItem[];
}

export interface Crumb {
  label: string;
  to?: string;
}

export type LinkRenderer = (props: { to: string; className: string; children: ReactNode; onClick?: () => void; "aria-current"?: "page" }) => ReactNode;

const isGroup = (i: NavItem): i is NavGroup => "children" in i;
const isHeading = (i: NavItem): i is NavHeading => "heading" in i;
const leavesOf = (items: NavItem[]): NavLeaf[] => items.flatMap((i) => (isGroup(i) ? i.children : isHeading(i) ? [] : [i]));

/** The leaf a path belongs to: the longest `to` that is the path or a prefix of it at a `/`, so a detail page keeps its list lit. */
export function activeLeaf(pathname: string, items: NavItem[]): NavLeaf | null {
  let best: NavLeaf | null = null;
  for (const l of leavesOf(items)) {
    if (l.external) continue;
    const hit = pathname === l.to || pathname.startsWith(l.to.endsWith("/") ? l.to : `${l.to}/`);
    if (hit && (!best || l.to.length > best.to.length)) best = l;
  }
  return best;
}

const defaultLink: LinkRenderer = ({ to, className, children, onClick, ...rest }) => (
  <a href={to} className={className} onClick={onClick} {...rest}>
    {children}
  </a>
);

const rowClass = (active: boolean) =>
  cn(
    "flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-left text-sm no-underline transition-colors [&_svg]:size-4 [&_svg]:shrink-0",
    active ? "bg-accent font-medium text-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
  );

function Rows({ items, pathname, link, onGroup, onNavigate }: { items: NavItem[]; pathname: string; link: LinkRenderer; onGroup?: (g: NavGroup) => void; onNavigate?: () => void }) {
  const active = activeLeaf(pathname, items);
  return (
    <ul className="flex flex-col gap-0.5">
      {items.map((i) => {
        if (isHeading(i))
          return i.label ? (
            <li key={i.key} className="px-2.5 pt-4 pb-1 text-xs font-medium text-muted-foreground">
              {i.label}
            </li>
          ) : (
            <li key={i.key} role="separator" className="my-2 border-t" />
          );
        if (isGroup(i)) {
          const on = i.children.some((c) => c.key === active?.key);
          return (
            <li key={i.key}>
              <button type="button" className={rowClass(on)} onClick={() => onGroup?.(i)}>
                {i.icon}
                <span className="flex-1 truncate">{i.label}</span>
                <ChevronRight className="text-muted-foreground" />
              </button>
            </li>
          );
        }
        const on = active?.key === i.key;
        return (
          <li key={i.key}>
            {i.external ? (
              <a href={i.to} className={rowClass(false)} target="_blank" rel="noopener noreferrer">
                {i.icon}
                <span className="flex-1 truncate">{i.label}</span>
              </a>
            ) : (
              link({
                to: i.to,
                className: rowClass(on),
                onClick: onNavigate,
                ...(on ? { "aria-current": "page" as const } : {}),
                children: (
                  <>
                    {i.icon}
                    <span className="flex-1 truncate">{i.label}</span>
                  </>
                ),
              })
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** One sliding layer; hidden ones are out of the tab order (inert). */
function Pane({ hidden, from, children }: { hidden: boolean; from: "left" | "right"; children: ReactNode }) {
  return (
    <div
      inert={hidden}
      aria-hidden={hidden}
      className={cn(
        "absolute inset-0 overflow-y-auto px-3 pb-4 transition-[translate,opacity] duration-180 ease-out motion-reduce:transition-none",
        hidden && (from === "left" ? "-translate-x-full opacity-0" : "translate-x-full opacity-0"),
      )}
    >
      {children}
    </div>
  );
}

function BackRow({ label, title, onClick, to, link }: { label: string; title: string; onClick?: () => void; to?: string; link: LinkRenderer }) {
  const inner = (
    <>
      <ChevronLeft />
      <span className="sr-only">{label}: </span>
      <span className="flex-1 truncate font-medium text-foreground">{title}</span>
    </>
  );
  const cls = cn(rowClass(false), "mb-2");
  return to ? link({ to, className: cls, children: inner }) : (
    <button type="button" className={cls} onClick={onClick} aria-label={`${label}: ${title}`}>
      {inner}
    </button>
  );
}

export function SidebarLayout({
  pathname,
  brand,
  nav,
  layer = null,
  top = {},
  footer,
  link = defaultLink,
  children,
}: {
  pathname: string;
  brand: ReactNode;
  nav: NavItem[];
  layer?: NavLayer | null;
  top?: { left?: ReactNode; crumbs?: Crumb[]; right?: ReactNode };
  /** The bottom of the sidebar, usually <AccountMenu side="above" align="start" />. */
  footer?: ReactNode;
  link?: LinkRenderer;
  children: ReactNode;
}) {
  // The group whose list is open: the route's own, until the user steps in or out by hand.
  const routeGroup = nav.filter(isGroup).find((g) => g.children.some((c) => c.key === activeLeaf(pathname, nav)?.key))?.key ?? null;
  const [openGroup, setOpenGroup] = useState<string | null>(routeGroup);
  const [synced, setSynced] = useState(routeGroup);
  if (synced !== routeGroup) {
    setSynced(routeGroup);
    setOpenGroup(routeGroup);
  }
  const [drawer, setDrawer] = useState(false);
  useEffect(() => setDrawer(false), [pathname]);
  const close = () => setDrawer(false);

  const groups = nav.filter(isGroup);
  const inGroup = !layer && openGroup ? groups.find((g) => g.key === openGroup) : undefined;
  const title = [...(top.crumbs ?? [])].map((c) => c.label).at(-1);

  const sidebar = (
    <nav aria-label="Main" className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center justify-between px-5">
        {brand}
        <button type="button" className="rounded-full p-1.5 text-muted-foreground hover:text-foreground md:hidden" aria-label="Close menu" onClick={close}>
          <X className="size-4" />
        </button>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <Pane hidden={Boolean(layer || inGroup)} from="left">
          <Rows items={nav} pathname={pathname} link={link} onNavigate={close} onGroup={(g) => setOpenGroup(g.key)} />
        </Pane>
        {groups.map((g) => (
          <Pane key={g.key} hidden={inGroup?.key !== g.key} from="right">
            <BackRow label="Back" title={g.label} onClick={() => setOpenGroup(null)} link={link} />
            <Rows items={g.children} pathname={pathname} link={link} onNavigate={close} />
          </Pane>
        ))}
        {layer && (
          <Pane key={layer.key} hidden={false} from="right">
            <BackRow label={layer.back.label} title={layer.title} to={layer.back.to} link={link} />
            {layer.header}
            <Rows items={layer.items} pathname={pathname} link={link} onNavigate={close} />
          </Pane>
        )}
      </div>
      {footer && <div className="shrink-0 border-t p-3">{footer}</div>}
    </nav>
  );

  return (
    <div className="min-h-dvh bg-background">
      {/* Sidebar: fixed from md up, a drawer below. */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r bg-background transition-transform duration-200 ease-out motion-reduce:transition-none md:translate-x-0",
          drawer ? "translate-x-0 shadow-card" : "-translate-x-full",
        )}
      >
        {sidebar}
      </div>
      {drawer && <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={close} aria-hidden />}
      <div className="md:pl-64">
        <header className="sticky top-0 z-20 grid h-14 grid-cols-[auto_1fr_auto] items-center gap-3 border-b bg-background/90 px-4 backdrop-blur md:grid-cols-[1fr_2fr_1fr] md:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button type="button" className="-ml-1 rounded-full p-1.5 text-muted-foreground hover:text-foreground md:hidden" aria-label="Open menu" onClick={() => setDrawer(true)}>
              <MenuIcon className="size-4" />
            </button>
            {top.left}
          </div>
          <Crumbs crumbs={top.crumbs ?? []} link={link} />
          <div className="flex items-center justify-end gap-2">{top.right}</div>
        </header>
        {title && <title>{title}</title>}
        <main>{children}</main>
      </div>
    </div>
  );
}

/** "Projects / acme/api / Secrets": parents muted and linked, the page itself in the text color. */
function Crumbs({ crumbs, link }: { crumbs: Crumb[]; link: LinkRenderer }) {
  if (!crumbs.length) return <div />;
  return (
    <ol className="hidden min-w-0 items-center justify-center gap-1.5 text-sm md:flex" aria-label="Breadcrumb">
      {crumbs.map((c, i) => {
        const last = i === crumbs.length - 1;
        return (
          <li key={i} className="flex min-w-0 items-center gap-1.5">
            {i > 0 && (
              <svg viewBox="0 0 16 16" className="size-4 shrink-0 text-border" aria-hidden="true">
                <path d="M10.5 2.5 5.5 13.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
              </svg>
            )}
            {last || !c.to ? (
              <span className={cn("truncate", last ? "font-medium text-foreground" : "text-muted-foreground")} aria-current={last ? "page" : undefined}>
                {c.label}
              </span>
            ) : (
              link({ to: c.to, className: "truncate text-muted-foreground no-underline hover:text-foreground", children: c.label })
            )}
          </li>
        );
      })}
    </ol>
  );
}

/**
 * The place you're in, and a menu to switch it: "acme/api ⌄" → other projects, "All projects",
 * and extra rows (Add project…). Searchable once there are more than seven.
 */
export function ScopeSwitcher({
  current,
  items,
  all,
  extra,
  link = defaultLink,
  label = "Switch",
  icon,
}: {
  /** What's shown; null for "all" (then `all.label`). */
  current: { key: string; label: string } | null;
  items: { key: string; label: string; to: string; hint?: string }[];
  all?: { label: string; to: string };
  /** Rows under the list ("Create project"); a function gets `close` to shut the menu first. */
  extra?: ReactNode | ((close: () => void) => ReactNode);
  link?: LinkRenderer;
  label?: string;
  icon?: ReactNode;
}) {
  const [q, setQ] = useState("");
  const shown = items.filter((i) => i.label.toLowerCase().includes(q.trim().toLowerCase()));
  const rowLink = (to: string, children: ReactNode, close: () => void, on: boolean) =>
    link({ to, onClick: close, className: cn("flex h-9 items-center gap-2 rounded-md px-2 text-sm no-underline hover:bg-accent", on ? "text-foreground" : "text-muted-foreground hover:text-foreground"), children });
  return (
    <Menu
      label={label}
      className="w-72"
      trigger={(p) => (
        <button
          type="button"
          onClick={p.toggle}
          aria-expanded={p.open}
          aria-haspopup="menu"
          className="flex h-8 max-w-full min-w-0 cursor-pointer items-center gap-2 rounded-full px-2.5 text-sm font-medium hover:bg-accent [&_svg]:size-4 [&_svg]:shrink-0"
        >
          {icon}
          <span className="truncate">{current?.label ?? all?.label ?? label}</span>
          <ChevronsUpDown className="text-muted-foreground" />
        </button>
      )}
    >
      {({ close }) => (
        <>
          {items.length > 7 && (
            <div className="mb-1 flex items-center gap-2 border-b px-2 pb-1.5">
              <Search className="size-4 text-muted-foreground" />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find…" className="h-8 w-full bg-transparent text-sm outline-none" aria-label="Find" />
            </div>
          )}
          {all && rowLink(all.to, all.label, close, !current)}
          {all && <MenuSeparator />}
          <div className="max-h-72 overflow-y-auto">
            {shown.map((i) =>
              rowLink(
                i.to,
                <>
                  <span className="flex-1 truncate">{i.label}</span>
                  {i.hint && <span className="text-xs text-muted-foreground">{i.hint}</span>}
                </>,
                close,
                current?.key === i.key,
              ),
            )}
            {!shown.length && <p className="px-2 py-2 text-sm text-muted-foreground">Nothing matches</p>}
          </div>
          {extra && (
            <>
              <MenuSeparator />
              {typeof extra === "function" ? extra(close) : extra}
            </>
          )}
        </>
      )}
    </Menu>
  );
}
