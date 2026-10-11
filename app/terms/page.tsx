import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { BRAND } from "@/lib/brand";
import { OPERATOR } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms for using ${BRAND}: accounts, credits and payments, who owns your books, acceptable use, and your rights as a consumer.`,
  alternates: { canonical: "/terms" },
};

const BODY = `## 1. Who we are

${BRAND} (www.scrivetta.com) is run by **${OPERATOR.name}**, a private individual based in ${OPERATOR.country} ("we", "us"). Contact: [${OPERATOR.email}](mailto:${OPERATOR.email}). By creating an account or using ${BRAND}, you agree to these terms. Our [Privacy Policy](/privacy) explains how we handle your data.

## 2. Your account

- You must be at least 16 to use ${BRAND}, and at least 18 (or have a parent's or guardian's permission) to buy credits or a subscription.
- Give accurate details and keep your password safe. You're responsible for what happens under your account.
- You can delete your account at any time by writing to us.

## 3. What ${BRAND} does

${BRAND} helps you create ebooks with AI: it analyses the materials you provide, proposes a book blueprint, writes and edits chapters, generates images and covers, and exports a typeset PDF. Features may change as we improve the product.

## 4. AI output — please review it

AI can make mistakes. Generated text may contain inaccuracies, omissions, or passages similar to existing works, especially when written from a brief alone (the quick path). **You are responsible for reviewing, fact-checking, and editing your book before you publish, sell, or rely on it**, and for following the rules of any store you publish on — for example, disclosing AI-generated content to Amazon KDP. ${BRAND} does not give legal, medical, financial, or other professional advice.

## 5. Who owns what

- **Your materials stay yours.** You give us only the permission needed to store and process them to provide the service.
- **Your books are yours.** As between you and us, you own the books you create with ${BRAND} and may publish and sell them. We claim no rights in them.
- Copyright law may not protect AI-generated text in the same way as human-written text; how much protection your book has depends on your own contribution and the law where you are.
- The ${BRAND} software, brand, and design belong to us.

## 6. Acceptable use

Don't use ${BRAND} to:

- upload material you don't have the right to use, or create content that infringes others' rights;
- create illegal content, or content that is hateful, harassing, sexually exploits minors, or promotes violence;
- deceive people — for example, impersonating a real person or passing off fabricated facts as real;
- attack, overload, scrape, or reverse-engineer the service, or get around credit limits.

We may suspend or close accounts that break these rules, and remove the content involved.

## 7. Credits, subscriptions, and payments

- Writing a book uses **credits: 1 credit = 1 page of the finished book**. Planning — adding materials, building a blueprint, and getting a length estimate — is free.
- Before generation starts, we show an estimated length and reserve credits for its upper end. After rendering, you're charged for the pages actually produced and the rest is returned. Your balance may go up to 10 credits below zero to finish a book.
- If a generation fails, the reserved credits are returned.
- **Credits don't expire**, have no cash value, and can't be transferred.
- Prices are shown in US dollars and payments are processed by Stripe. The **subscription** renews monthly and adds its credits on each successful payment. Cancel any time from the billing page; it stops at the end of the paid period, and credits already added stay in your account.

## 8. Right of withdrawal (EU consumers)

If you're a consumer in the EU, you may withdraw from a purchase within **14 days** by emailing us, and we'll refund you. Because credits are digital content supplied immediately, you **lose the right of withdrawal for credits you have used**: by starting a book generation you ask us to perform the service right away and acknowledge this. Unused credits from the purchase remain refundable within the 14 days.

Nothing in these terms limits your statutory rights as a consumer.

## 9. Availability and changes

We work to keep ${BRAND} running and your books safe, but we can't promise uninterrupted service. Keep your own copy of anything important — you can download your PDFs at any time. If we ever shut ${BRAND} down, we'll give you at least 30 days' notice to download your books, and refund unused credits bought in the previous 12 months.

## 10. Liability

To the extent the law allows, we aren't liable for indirect losses, lost profits, or what you do with generated content, and our total liability is limited to what you paid us in the 12 months before the claim. This doesn't limit liability for intent or gross negligence, or any liability that can't be limited by law.

## 11. Ending the agreement

You can stop using ${BRAND} and delete your account at any time. We may end the agreement or suspend your account if you seriously or repeatedly break these terms; where possible we'll warn you first and let you download your books.

## 12. Changes to these terms

We may update these terms. We'll change the date at the top and, for significant changes, email account holders at least 14 days in advance. If you don't agree, you can close your account before the changes take effect.

## 13. Law and disputes

These terms are governed by Polish law. If you're a consumer, you also keep the protection of the mandatory laws of the country where you live, and can bring a claim in your local courts. Please write to us first — most issues are easiest to fix directly.`;

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro={`The rules for using ${BRAND}, in plain language.`}
      body={BODY}
    />
  );
}
