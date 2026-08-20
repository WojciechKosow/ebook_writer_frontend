import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center bg-surface-2/60 px-6 py-16">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
