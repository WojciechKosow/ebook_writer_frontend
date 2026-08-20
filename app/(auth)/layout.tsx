export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-surface-2/60 px-6 py-12">
      {children}
    </main>
  );
}
