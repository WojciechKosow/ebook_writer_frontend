import type { StoreProfile } from "@/lib/types";

/** "Before you buy" — the questions every buyer has, answered for this store. */
export function StoreFaq({ profile }: { profile: StoreProfile }) {
  const who = profile.authorName || profile.name;
  const items = [
    {
      q: "How do I get my ebook?",
      a: "Right after payment you get an email with a download link. It works for 30 days and up to 5 downloads — save the PDF to your phone or computer.",
    },
    {
      q: "Do I need an account?",
      a: "No. Pay securely by card through Stripe and the link arrives in your inbox.",
    },
    {
      q: "Something went wrong — who do I contact?",
      a: profile.contactEmail
        ? `Write to ${who} at ${profile.contactEmail}. You're buying directly from ${who}, who handles questions and refunds.`
        : `You're buying directly from ${who}, who handles questions and refunds. Reply to your receipt email to reach them.`,
    },
  ];
  return (
    <section id="help" className="mx-auto w-full max-w-[760px] scroll-mt-24 px-4 py-12 sm:px-6">
      <h2 className="font-display text-[30px] font-normal leading-tight text-foreground">Before you buy</h2>
      <div className="mt-5">
        {items.map((item, i) => (
          <details key={item.q} open={i === 0} className="border-t border-hairline py-4 last:border-b">
            <summary className="cursor-pointer text-[16px] font-semibold text-foreground">{item.q}</summary>
            <p className="mt-2.5 text-[15px] leading-relaxed text-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/** The three reassurances under the hero and on every ebook page. */
export const TRUST_POINTS = (who: string) => [
  { icon: "download", text: "Instant PDF by email" },
  { icon: "lock", text: "Secure checkout with Stripe" },
  { icon: "person", text: `You buy directly from ${who}` },
];

export function TrustIcon({ name }: { name: string }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "download") return <svg {...common}><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></svg>;
  if (name === "lock") return <svg {...common}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>;
  if (name === "mail") return <svg {...common}><path d="M4 6h16v12H4z" /><path d="m4 7 8 6 8-6" /></svg>;
  return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>;
}
