import { BRAND } from "@/lib/brand";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6 text-sm text-zinc-500 dark:text-zinc-400">
        <span>
          © {new Date().getFullYear()} {BRAND}
        </span>
        <span>AI-assisted ebook generation</span>
      </div>
    </footer>
  );
}
