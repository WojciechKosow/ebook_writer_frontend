"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCredits } from "@/lib/credits-context";
import { BRAND } from "@/lib/brand";
import { BrandMark } from "./brand-mark";
import { ThemeToggle } from "./theme-toggle";
import { AmbientLayer } from "./landing/ambient";

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
  // The library gets a quiet band of drifting pages above its header; other
  // workspace screens stay plain (the writing room brings its own).
  const showBand = usePathname() === "/dashboard";

  return (
    <div className="flex min-h-screen">
      {/* Sidebar (sticky full-height on desktop, slide-over on mobile) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[260px] transform border-r border-ip-hair bg-ip-surface transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent onNavigate={() => setOpen(false)} />
      </aside>

      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-[rgba(27,24,20,.45)] lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Main column */}
      <div className="relative flex min-w-0 flex-1 flex-col">
        {showBand && <AmbientLayer variant="band" />}
        {/* Mobile top bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-ip-hair bg-ip-glass px-4 py-2.5 backdrop-blur-md lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="grid h-9 w-9 place-items-center rounded-lg border border-ip-line bg-ip-surface text-ip-muted"
          >
            <IconMenu className="h-5 w-5" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <BrandMark className="h-7 w-7" />
            <span className="font-display text-xl font-medium">{BRAND}</span>
          </Link>
          <ThemeToggle />
        </div>

        <main className="relative z-[1] mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">{children}</main>
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
      <div className="flex items-center px-5 pb-3 pt-5">
        <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-2.5">
          <BrandMark className="h-8 w-8" />
          <span className="font-display text-[22px] font-medium tracking-[-0.01em] text-ip-ink">{BRAND}</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        <Link
          href="/ebooks/new"
          onClick={onNavigate}
          className="ip-cta mb-3 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-ip-ink px-3 py-2.5 text-sm font-semibold text-ip-bg"
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
        <div className="rounded-2xl border border-ip-hair bg-ip-bg p-4">
          <div className="flex items-center justify-between text-xs text-ip-muted">
            Credits
            <Link href="/billing" onClick={onNavigate} className="font-semibold text-ip-accent hover:underline">
              Top up
            </Link>
          </div>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="font-display text-[34px] font-light leading-tight text-ip-ink tabular-nums">
              {credits?.balance ?? "…"}
            </span>
            <span className="text-[13px] text-ip-muted">pages left</span>
          </div>
        </div>
      </div>

      {/* Footer: user + theme + logout */}
      <div className="mt-3 border-t border-ip-hair p-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ip-cover font-display text-base text-[#f3e7cf]">
            {initials}
          </span>
          <p className="min-w-0 flex-1 truncate text-xs text-ip-muted" title={user?.email}>
            {user?.email}
          </p>
          <ThemeToggle />
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm text-ip-ink-2 transition-colors hover:bg-ip-bg hover:text-ip-ink"
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
    <p className="px-3 pb-1.5 pt-4 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ip-muted">
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
      aria-current={active ? "page" : undefined}
      className={`flex min-h-[42px] items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm transition-colors ${
        active
          ? "bg-ip-bg font-semibold text-ip-ink"
          : "text-ip-ink-2 hover:bg-ip-bg hover:text-ip-ink"
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
