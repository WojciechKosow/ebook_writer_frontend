"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCredits } from "@/lib/credits-context";
import { BRAND } from "@/lib/brand";
import { Wordmark } from "./brand-mark";
import { ThemeToggle } from "./theme-toggle";

type NavItem = {
  href: string;
  label: string;
  icon: (p: { className?: string }) => React.ReactElement;
  isActive: (path: string) => boolean;
};

const WORKSPACE: NavItem[] = [
  {
    href: "/dashboard",
    label: "Your library",
    icon: IconBooks,
    isActive: (p) => p === "/dashboard" || (p.startsWith("/ebooks/") && p !== "/ebooks/new"),
  },
];

const ACCOUNT: NavItem[] = [
  {
    href: "/billing",
    label: "Billing & credits",
    icon: IconCard,
    isActive: (p) => p.startsWith("/billing"),
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar (sticky full-height on desktop, slide-over on mobile) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-hairline bg-surface transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent onNavigate={() => setOpen(false)} />
      </aside>

      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between border-b border-hairline bg-surface px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="grid h-9 w-9 place-items-center rounded-lg border border-hairline text-muted"
          >
            <IconMenu className="h-5 w-5" />
          </button>
          <Link href="/dashboard" className="font-semibold text-foreground">
            {BRAND}
          </Link>
          <ThemeToggle />
        </div>

        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const credits = useCredits();

  async function handleLogout() {
    onNavigate();
    await logout();
    router.replace("/login");
  }

  const initials = (user?.email ?? "?").charAt(0).toUpperCase();

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-16 items-center border-b border-hairline px-5">
        <Wordmark href="/dashboard" onClick={onNavigate} />
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <Link
          href="/ebooks/new"
          onClick={onNavigate}
          className="mb-2 flex items-center justify-center gap-2 rounded-xl bg-accent px-3 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:brightness-95"
        >
          <IconPlus className="h-4 w-4" />
          New ebook
        </Link>

        <GroupLabel>Workspace</GroupLabel>
        {WORKSPACE.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} />
        ))}

        <GroupLabel>Account</GroupLabel>
        {ACCOUNT.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} />
        ))}
      </nav>

      {/* Credits */}
      <div className="px-3">
        <div className="rounded-xl border border-hairline bg-gradient-to-br from-accent-soft to-surface p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Credits</span>
            <Link
              href="/billing"
              onClick={onNavigate}
              className="rounded-lg bg-accent px-2.5 py-1 text-xs font-semibold text-white transition hover:brightness-95"
            >
              Buy
            </Link>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {credits?.balance ?? "…"}
            </span>
            <span className="text-xs font-medium text-muted">left</span>
          </div>
        </div>
      </div>

      {/* Footer: user + theme + logout */}
      <div className="mt-3 border-t border-hairline p-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-gradient-to-br from-brass to-accent-2 text-sm font-semibold text-white">
            {initials}
          </span>
          <p className="min-w-0 flex-1 truncate text-xs text-muted" title={user?.email}>
            {user?.email}
          </p>
          <ThemeToggle />
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          <IconLogout className="h-[18px] w-[18px]" />
          Log out
        </button>
      </div>
    </div>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pb-1.5 pt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-faint">
      {children}
    </p>
  );
}

function NavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate: () => void;
}) {
  const active = item.isActive(pathname);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "bg-accent-soft text-accent-ink"
          : "text-muted hover:bg-surface-2 hover:text-foreground"
      }`}
    >
      <Icon className="h-[18px] w-[18px]" />
      {item.label}
    </Link>
  );
}

// ---- Icons -----------------------------------------------------------------

function IconPlus({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function IconBooks({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </svg>
  );
}
function IconCard({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}
function IconLogout({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}
function IconMenu({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}
