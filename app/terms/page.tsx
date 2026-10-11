import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { BRAND } from "@/lib/brand";
import { OPERATOR } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms for using ${BRAND}: accounts, AI output, your content, acceptable use, and payments.`,
  alternates: { canonical: "/terms" },
};

const BODY = `## 1. Who we are

${BRAND} (www.scrivetta.com) is run by **${OPERATOR.name}**, a private individual based in ${OPERATOR.country}. Contact: [${OPERATOR.email}](mailto:${OPERATOR.email}). By creating an account or using ${BRAND}, you agree to these terms. Our [Privacy Policy](/privacy) explains how we handle your data.

## 2. Your account

You must be at least 16 to use ${BRAND}, and an adult (or have a parent's or guardian's permission) to make purchases. Keep your login details safe; you're responsible for activity under your account. You can ask us to delete your account at any time.

## 3. The service

${BRAND} helps you create ebooks with AI. The service is provided "as is" and "as available", and its features, prices, and plans may change.

## 4. AI output

AI can make mistakes. Generated text and images may be inaccurate, incomplete, or similar to existing works. **You are responsible for reviewing and checking your book before you publish, sell, or rely on it**, and for following the rules of any store you publish on. ${BRAND} doesn't provide legal, medical, financial, or other professional advice.

## 5. Your content

Your materials and the books you create are yours; we don't claim ownership of them. You give us permission to store and process them only as needed to provide the service. You confirm you have the right to use everything you upload.

## 6. Acceptable use

Don't use ${BRAND} for anything illegal, to infringe others' rights, to create harmful or deceptive content, or to disrupt or misuse the service. We may suspend or close accounts that do.

## 7. Credits and payments

Writing books uses credits, as described on the [pricing page](/#pricing) at the time of purchase. Payments are processed by Stripe. Credits have no cash value and can't be transferred. If you're a consumer, starting a book generation is your request for us to perform the service immediately.

## 8. Liability

To the extent permitted by law, we're not liable for indirect or consequential losses, or for how you use generated content, and our total liability is limited to the amount you paid us in the 12 months before the claim.

## 9. Changes and termination

We may update these terms; the date at the top shows the current version, and continuing to use ${BRAND} means you accept it. You can stop using ${BRAND} at any time. We may suspend or end access if these terms are broken.

## 10. Law

These terms are governed by Polish law. Nothing in them limits rights you have as a consumer under mandatory law.`;

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro={`The rules for using ${BRAND}, in plain language.`}
      body={BODY}
    />
  );
}
