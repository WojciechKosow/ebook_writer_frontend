import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-zinc-900/40">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
