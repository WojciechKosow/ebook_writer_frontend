"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCredits } from "@/lib/credits-context";
import { BRAND } from "@/lib/brand";
import { ThemeToggle } from "./theme-toggle";

type NavItem = {
  href: string;
  label: string;
  icon: (p: { className?: string }) => React.ReactElement;
  isActive: (path: string) => boolean;
};

const NAV: NavItem[] = [
  {
    href: "/ebooks/new",
    label: "New ebook",
    icon: IconPen,
    isActive: (p) => p === "/ebooks/new",
  },
  {
    href: "/dashboard",
    label: "Your ebooks",
    icon: IconBooks,
    isActive: (p) => p === "/dashboard" || (p.startsWith("/ebooks/") && p !== "/ebooks/new"),
  },
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
    <div className="flex min-h-full">
      {/* Sidebar (static on desktop, slide-over on mobile) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-hairline bg-paper transition-transform duration-200 lg:static lg:translate-x-0 ${
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
        <div className="flex items-center justify-between border-b border-hairline bg-paper px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="grid h-9 w-9 place-items-center rounded-lg border border-hairline text-ink-soft"
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

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2 border-b border-hairline px-5">
        <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-2 font-semibold text-foreground">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-accent text-sm text-white">
            {BRAND.charAt(0)}
          </span>
          {BRAND}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map((item) => {
          const active = item.isActive(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-accent/10 text-accent"
                  : "text-ink-soft hover:bg-paper-soft hover:text-foreground"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Credits */}
      <div className="px-3">
        <Link
          href="/billing"
          onClick={onNavigate}
          className="flex items-center justify-between rounded-lg border border-hairline bg-paper-soft/60 px-3 py-2.5 text-sm hover:bg-paper-soft"
        >
          <span className="flex items-center gap-2 text-foreground">
            <span className="text-accent">◆</span>
            <span className="font-semibold">{credits?.balance ?? "…"}</span>
            <span className="text-ink-soft">credits</span>
          </span>
          <span className="text-xs font-medium text-accent">Buy</span>
        </Link>
      </div>

      {/* Footer: user + theme + logout */}
      <div className="mt-4 space-y-3 border-t border-hairline px-3 py-4">
        <div className="flex items-center justify-between px-1">
          <p className="min-w-0 truncate text-xs text-ink-soft" title={user?.email}>
            {user?.email}
          </p>
          <ThemeToggle />
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-paper-soft hover:text-foreground"
        >
          <IconLogout className="h-[18px] w-[18px]" />
          Log out
        </button>
      </div>
    </div>
  );
}

// ---- Icons -----------------------------------------------------------------

function IconPen({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
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
