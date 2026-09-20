import { BRAND } from "./brand";

// The blog content layer. Posts are authored inline as Markdown (rendered with
// `marked`) so there's no MDX toolchain to configure. Add a post by appending
// an entry here — the /blog list, each /blog/[slug] page, and the sitemap all
// read from this array, so a new post is discoverable everywhere at once.
export type BlogPost = {
  slug: string;
  /** Page <h1> and the base for the <title> tag. */
  title: string;
  /** Meta description + the excerpt shown on the blog index. */
  description: string;
  /** Target search terms for this post (documents intent; feeds keywords). */
  keywords: string[];
  /** ISO date (YYYY-MM-DD). Used for sitemap lastmod and article schema. */
  date: string;
  /** Rough read time in minutes, shown on the card and byline. */
  readingMinutes: number;
  /** Post body as Markdown. */
  body: string;
};

// Newest first — this is also the display and sitemap order.
export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "self-publish-ai-written-ebook",
    title: "How to Self-Publish an AI-Written Ebook, Step by Step",
    description:
      "From finished manuscript to a live listing: how to edit, format, and self-publish an AI-written ebook on Amazon KDP and other stores — the right way.",
    keywords: [
      "self-publish AI",
      "self-publishing AI",
      "publish an ebook",
      "AI written ebook",
    ],
    date: "2026-09-08",
    readingMinutes: 7,
    body: `Writing the book used to be the hard part. With an [AI ebook generator](/ai-ebook-generator), the draft comes together in an afternoon — so the real work shifts to editing and publishing well. Here's a clean, repeatable path from finished manuscript to a live listing.

## 1. Start from a complete draft, not a blank page

Self-publishing goes faster when you begin with a full manuscript — outline, every chapter, and a consistency pass already done. That's exactly what ${BRAND} produces, so you spend your time improving a real book instead of staring at a cursor.

## 2. Edit for your voice

AI gives you structure and momentum; you give it judgement. Read the whole thing once, out loud if you can, and:

- Cut repetition and filler sentences.
- Rewrite any passage that doesn't sound like you.
- Check facts, names, and numbers — never publish claims you haven't verified.

## 3. Format for readers

A book that looks amateur gets returned. Keep formatting simple and consistent: a clear chapter structure, readable paragraph spacing, and a title page. ${BRAND} exports a typeset, print-ready PDF, and most stores also accept EPUB for reflowable reading.

## 4. Design a cover that earns the click

On a store page your cover is a thumbnail first. Use a bold title, high contrast, and one clear focal image. Test it small — if it reads at 100 pixels wide, it works.

## 5. Publish where your readers are

[Amazon KDP](https://kdp.amazon.com/) is the largest marketplace and the usual first stop, but you can also list on Apple Books, Kobo, and Google Play Books, or sell direct. Fill in a keyword-rich description, pick the two most accurate categories, and price to match comparable titles in your niche.

## 6. Keep improving after launch

Publishing is the start, not the finish. Watch which keywords bring readers, refresh your description, and use reviews to guide a second edition. Because your source book lives in ${BRAND}, revising and re-exporting is quick.

---

Ready to skip the blank page? [Start writing free](/register) and have a complete draft to publish today.`,
  },
  {
    slug: "plan-an-ebook-outline-with-ai",
    title: "How to Plan an Ebook Outline with AI (Before You Write a Word)",
    description:
      "A strong outline is what separates a book that flows from one that rambles. Here's how to use AI to plan an ebook outline that actually holds together.",
    keywords: [
      "ebook outline",
      "plan a book with AI",
      "AI book writer",
      "create an ebook",
    ],
    date: "2026-08-21",
    readingMinutes: 6,
    body: `Most books that stall don't stall because of the writing — they stall because of the plan. A clear outline is the scaffolding everything else hangs on. Here's how to build one with AI in minutes instead of days.

## Start with one honest sentence

Before any tool, finish this line: *"This book helps [who] to [do what]."* Everything in your outline should serve that promise. If a chapter doesn't, it's a different book.

## Let AI propose the structure

Give an [AI book writer](/ai-ebook-generator) your topic, audience, and rough length, and let it draft a chapter-by-chapter outline. You'll get a full skeleton to react to — which is far easier than inventing one from scratch. ${BRAND} does this as the first step of every book, so the outline and the writing stay connected.

## Pressure-test each chapter

Go through the proposed outline and ask three questions of every chapter:

1. **Does it earn its place?** One clear idea per chapter.
2. **Is it in the right order?** Each chapter should set up the next.
3. **Is anything missing?** Look for the gap a reader would notice.

## Right-size the scope

A common mistake is planning a 300-page epic and finishing none of it. Match length to purpose: a focused guide of 40–80 pages often serves readers better — and ships. With credit-based writing you can always extend a book later, so start lean.

## Turn the outline into a draft

Once the outline holds together, the writing is the easy part. ${BRAND} takes the approved structure and writes each chapter, then edits the whole manuscript for consistency — so the finished book matches the plan you signed off on.

---

Stop planning in circles. [Start writing free](/register) and get an AI-drafted outline for your book in minutes.`,
  },
];

export const BLOG_SLUGS = BLOG_POSTS.map((p) => p.slug);

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

// Human-readable date for bylines, stable across locales/timezones (the string
// is parsed as UTC and formatted in UTC so it never shifts by a day).
export function formatPostDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
