import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { CookieSettingsLink } from "@/components/cookie-consent";
import { BRAND } from "@/lib/brand";
import { OPERATOR } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${BRAND} collects, uses, and protects your personal data, which providers process it, the cookies we use, and your rights under the GDPR.`,
  alternates: { canonical: "/privacy" },
};

const BODY = `## Who is responsible for your data

${BRAND} (www.scrivetta.com) is run by **${OPERATOR.name}**, a private individual based in ${OPERATOR.country}, who is the controller of your personal data. Contact for anything about your data: **[${OPERATOR.email}](mailto:${OPERATOR.email})**.

## What we collect

- **Account data** — your email address, name, and a securely hashed password. If you sign in with Google, we receive your Google account's email, name, and profile picture.
- **Your content** — book briefs, the materials you upload (files and notes), blueprint answers, generated chapters and books, and images you upload or generate.
- **Payment data** — payments are handled by Stripe. We never see or store your full card number; we receive your Stripe customer ID, what you bought, and the payment status.
- **Technical data** — IP address, browser and device information, and server logs, used to run and secure the service.
- **Analytics** — with your consent, Google Analytics data about pages visited and how you arrived. Vercel Web Analytics collects aggregated, cookieless page statistics.

## Why we use it, and on what legal basis

| Purpose | Legal basis (GDPR) |
| --- | --- |
| Creating your account and providing the service: processing your materials, writing, rendering, and storing your books | Performance of a contract — Art. 6(1)(b) |
| Payments, credits, and billing records | Performance of a contract and legal obligations — Art. 6(1)(b) and (c) |
| Transactional emails (verification, password reset) | Performance of a contract — Art. 6(1)(b) |
| Security, abuse prevention, and fixing errors | Legitimate interests — Art. 6(1)(f) |
| Aggregated, cookieless statistics (Vercel Web Analytics) | Legitimate interests — Art. 6(1)(f) |
| Google Analytics cookies | Your consent — Art. 6(1)(a), which you can withdraw at any time |

We don't sell your data and don't use it for advertising.

## How AI processes your content

To build your book, ${BRAND} sends your brief, materials, and answers to AI providers: **OpenAI** reads and organises your materials, plans the blueprint, and generates images; **Anthropic** (Claude) writes and edits the chapters. Under their API terms, these providers do not use content sent through their APIs to train their models by default. Only the parts needed for each step are sent.

## Who processes data for us

| Provider | What for | Location |
| --- | --- | --- |
| Vercel | Website hosting, cookieless web analytics | USA / EU |
| Railway | Application server and database | USA / EU |
| Cloudflare (R2) | Storage of uploaded and generated images | Global |
| OpenAI | Material analysis, book planning, image generation | USA |
| Anthropic | Writing and editing chapters | USA |
| Stripe | Payments and subscriptions | USA / EU |
| Postmark (ActiveCampaign) | Transactional email | USA |
| Google | Google sign-in; Google Analytics (with consent) | USA / EU |

Some providers are in the USA. Transfers rely on the EU–US Data Privacy Framework where the provider is certified, or on the European Commission's Standard Contractual Clauses.

## How long we keep it

- **Account data and content** — while your account exists. When you ask us to delete your account, we delete your data, except where we must keep something by law.
- **Payment records** — as long as tax and accounting law requires.
- **Server logs** — only as long as needed to keep the service secure and fix errors.
- **Google Analytics data** — for the retention period set in Google Analytics, at most 14 months.

## Your rights

You can ask to **access**, **correct**, **delete**, or **export** your data, to **restrict** its processing, and to **object** to processing based on legitimate interests. Where processing is based on consent, you can **withdraw** it at any time without affecting earlier processing. Write to [${OPERATOR.email}](mailto:${OPERATOR.email}); we reply within the time the GDPR requires.

You can also complain to a data protection authority. In Poland that is the President of the Personal Data Protection Office (Prezes Urzędu Ochrony Danych Osobowych, [uodo.gov.pl](https://uodo.gov.pl)).

<h2 id="cookies">Cookies and similar storage</h2>

| Name | Type | What it does | How long |
| --- | --- | --- | --- |
| \`refreshToken\` | Necessary (cookie) | Keeps you signed in | Up to 30 days |
| \`oauth_state\` | Necessary (cookie) | Protects Google sign-in against forgery | A few minutes |
| \`ebook.accessToken\` | Necessary (local storage) | Your current session | Until you sign out |
| \`theme\`, drafts, view settings | Necessary (local storage) | Remembers your theme, unsaved brief, and layout | Until you clear them |
| \`scrivetta.consent.v1\` | Necessary (local storage) | Remembers your cookie choice | Until you clear it |
| \`_ga\`, \`_ga_*\` | Analytics (cookie, Google) | Google Analytics, only if you accept | Up to 2 years |

Vercel Web Analytics doesn't use cookies. Stripe sets its own cookies on its checkout pages to process payments and prevent fraud.

## Children

${BRAND} isn't intended for children under 16, and we don't knowingly collect their data.

## Changes

We may update this policy. The date at the top shows when it last changed.`;

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={`What data ${BRAND} collects, why, who processes it, and what you can do about it.`}
      body={BODY}
    >
      <p className="mt-8 text-[15px] text-muted">
        Change your cookie choice at any time:{" "}
        <CookieSettingsLink className="font-medium text-accent-ink underline underline-offset-2" />
      </p>
    </LegalPage>
  );
}
