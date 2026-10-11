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
  /** ISO date (YYYY-MM-DD) the post was first published. */
  date: string;
  /**
   * ISO date of the last substantial rewrite, if any. Feeds sitemap lastmod,
   * the article's dateModified, and the "Updated" byline. Leave unset for typo
   * fixes — search engines only trust modified dates that mean something.
   */
  updated?: string;
  /** Rough read time in minutes, shown on the card and byline. */
  readingMinutes: number;
  /** Post body as Markdown. */
  body: string;
};

// Newest first — this is also the display and sitemap order.
export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "can-you-publish-a-book-written-by-ai",
    title: "Can You Publish a Book Written by AI? KDP Rules and Copyright in 2026",
    description:
      "Yes — but with conditions. What Amazon KDP requires you to disclose, who owns the copyright in AI-written text, and a checklist before you hit publish.",
    keywords: [
      "can i publish a book written by ai",
      "publish AI written book",
      "KDP AI disclosure",
      "AI book copyright",
      "is AI generated content copyrighted",
    ],
    date: "2026-10-11",
    readingMinutes: 8,
    body: `**Short answer:** yes. You can publish a book written with AI on Amazon KDP and most other stores. But three things come with it: you have to disclose AI-generated content to Amazon, copyright only protects the parts a human actually authored, and you are fully responsible for what the book says.

Here's what each of those means in practice. This is a practical overview, not legal advice — if a lot of money or a contract depends on it, talk to a lawyer in your country.

## What Amazon KDP requires

Amazon doesn't ban AI-written books. Since September 2023, its [KDP Content Guidelines](https://kdp.amazon.com/en_US/help/topic/G200672390) split AI use into two kinds:

- **AI-generated** — an AI tool created the actual content: text, images, or a translation. It counts as AI-generated *even if you edited it substantially afterwards*. You must tell KDP about it when you publish a new book, and when you edit and republish an existing one.
- **AI-assisted** — you wrote the content yourself and used AI to edit, refine, error-check, or brainstorm. You don't need to disclose this.

Images count too. An AI-generated cover or interior illustration is AI-generated content, even if every word of the text is yours.

Whatever the category, KDP makes you responsible for making sure the book follows all of its content guidelines, including intellectual-property rules. In 2023 Amazon also [capped new title creation at three per day](https://authorsguild.org/news/amazon-adds-to-kdp-generative-ai-policy-caps-daily-self-publishing-uploads/) per account, aimed at mass-produced AI books, and said the number may change.

**What this means for you:** if an AI tool wrote the chapters — including ${BRAND}, even when it writes from your own notes — answer "yes" to the AI-generated question. Disclosure is a checkbox, not a penalty. Hiding it is what puts an account at risk.

## Who owns the copyright?

In the US, copyright requires a human author. Two recent milestones made that clear:

- In January 2025 the US Copyright Office published [Copyright and Artificial Intelligence, Part 2: Copyrightability](https://www.copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf). Its conclusion: **prompts alone don't make you the author** of what the AI produces. What *is* protected is the human contribution — your own text that shows up in the output, and your creative selection, arrangement, and modification of AI material. The Office says it has registered hundreds of works that include AI material, covering the human parts.
- In March 2025 a federal appeals court ruled in *Thaler v. Perlmutter* that human authorship is required for copyright, and in March 2026 the [Supreme Court declined to hear the case](https://www.scotusblog.com/cases/thaler-v-perlmutter/), leaving that rule in place.

Other countries have their own rules, and most are still settling. The direction is the same almost everywhere, though: the more of the book that is genuinely yours, the stronger your claim to it.

**What this means for you:** a book generated from a one-line prompt has thin protection — someone could copy large parts of it. A book built from your own notes, examples, and experience, then edited by you, has a real human core. Keep your source material and your edits; they're your evidence of authorship.

## The bigger risk isn't legal — it's quality

Readers return books that feel generic, and reviews follow. The stores are full of AI books that say nothing new. What sets yours apart is what only you know:

- your own examples, numbers, and stories,
- your opinions and the mistakes you've seen people make,
- checked facts — AI can state wrong things with full confidence.

That's why ${BRAND} writes from your material first, asks when something is missing, and covers gaps only in general terms instead of inventing details. It's also why we label writing from a brief alone as the *quick path*: great for a first draft, but read it and check it before it goes anywhere near a store.

## Checklist before you publish an AI-written book

1. **Read the whole book yourself.** Every chapter, start to finish.
2. **Check every fact, name, number, and quote.** Remove anything you can't verify.
3. **Add what only you can add** — examples, opinions, experience.
4. **Make sure nothing infringes someone else's work.** No copied passages, no trademarked characters, no other author's title.
5. **Disclose honestly on KDP** — AI-generated text, and separately an AI-generated cover or images.
6. **Keep your records** — notes, sources, and edits — in case authorship is ever questioned.
7. **Follow each store's rules.** Other stores have their own policies; read them before you upload.

## Sources

- [KDP Content Guidelines — Artificial intelligence (AI) content](https://kdp.amazon.com/en_US/help/topic/G200672390), Amazon
- [Copyright and Artificial Intelligence, Part 2: Copyrightability](https://www.copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf), US Copyright Office, January 2025
- [Thaler v. Perlmutter](https://www.scotusblog.com/cases/thaler-v-perlmutter/), SCOTUSblog case file
- [Amazon caps daily self-publishing uploads](https://authorsguild.org/news/amazon-adds-to-kdp-generative-ai-policy-caps-daily-self-publishing-uploads/), Authors Guild, 2023

---

Want a book that's genuinely yours? [Plan your book free](/register): upload what you know and ${BRAND} builds the chapters around your own material. Next, read [how to self-publish an AI-written ebook](/blog/self-publish-ai-written-ebook).`,
  },
  {
    slug: "self-publish-ai-written-ebook",
    title: "How to Self-Publish an AI-Written Ebook, Step by Step",
    description:
      "From draft to a live listing: how to make an AI-written ebook genuinely yours, check it, format it, disclose it, and self-publish it on Amazon KDP and other stores.",
    keywords: [
      "self-publish AI",
      "self-publishing AI",
      "publish an ebook",
      "AI written ebook",
    ],
    date: "2026-09-08",
    updated: "2026-10-11",
    readingMinutes: 8,
    body: `AI can get you from an idea to a full draft fast. What it can't do is make the book worth buying — that part is still yours. Here's a repeatable path from draft to a live listing that readers won't return.

## 1. Start from what you know, not from a prompt

The books that work are the ones only their author could have written. Before you generate anything, gather your material: notes, documents, slides, past articles, project files. An [AI ebook generator](/ai-ebook-generator) that writes from that material produces *your* book. One that writes from a single sentence produces an average of everything on the internet.

In ${BRAND}, this is the first step: you upload what you know, it maps it into a chapter blueprint, and it asks you about anything your material doesn't cover — before a single chapter is written. In a hurry, you can still draft from a brief alone (the quick path), but expect to rewrite more.

## 2. Approve the structure before the writing

Fixing a bad outline after 150 pages is painful. Review the chapter plan first: one clear idea per chapter, in an order where each chapter sets up the next, with nothing a reader would miss. Our guide to [planning an ebook outline](/blog/plan-an-ebook-outline-with-ai) walks through it.

## 3. Read every word, then edit for your voice

This is the step that separates a real book from AI filler. Read the whole draft once, out loud if you can, and:

- cut repetition and sentences that say nothing,
- rewrite anything that doesn't sound like you,
- add your own examples, stories, and opinions,
- check every fact, name, number, and quote — AI can be confidently wrong.

${BRAND} runs an editorial pass and a quality check (unfinished sections, repeats, layout problems) before you see the book, but that doesn't replace your read-through.

## 4. Format for the edition you're publishing

Print and ebook editions need different files:

- **Paperback:** a print-ready PDF at the right trim size. ${BRAND} exports a typeset 6×9 inch PDF — one of the most common trim sizes on KDP — with embedded fonts, a table of contents, and chapter openers.
- **Kindle ebook:** KDP [recommends reflowable formats](https://kdp.amazon.com/en_US/help/topic/G200634390) such as EPUB, DOCX, or KPF; PDFs are accepted but convert less reliably. Run whatever you upload through Kindle Previewer first.

## 5. Design a cover that earns the click

On a store page your cover is a thumbnail first. Use a bold title, high contrast, and one clear focal image. Test it small — if it reads at 100 pixels wide, it works. If the cover art is AI-generated, remember it needs disclosing too.

## 6. Disclose AI use honestly

KDP asks whether your book contains AI-generated text, images, or translations. If an AI tool wrote the chapters, the answer is yes — even after heavy editing. We cover the rules and the copyright question in detail in [Can you publish a book written by AI?](/blog/can-you-publish-a-book-written-by-ai)

## 7. Publish where your readers are

[Amazon KDP](https://kdp.amazon.com/) is the largest marketplace and the usual first stop, but you can also list on Apple Books, Kobo, and Google Play Books, or sell direct. Write a specific, keyword-aware description, pick the two most accurate categories, and price against comparable titles in your niche.

## 8. Keep improving after launch

Publishing is the start, not the finish. Watch which keywords bring readers, refresh your description, and use reviews to guide a second edition. Because the source book lives in ${BRAND}'s editor, revising and re-exporting is quick.

---

Ready to write a book that's genuinely yours? [Plan your book free](/register): add your notes, approve the blueprint, and get a complete draft to review before you publish.`,
  },
  {
    slug: "plan-an-ebook-outline-with-ai",
    title: "How to Write an Ebook Outline (With AI and Free Templates)",
    description:
      "A strong ebook outline is what separates a book that flows from one that rambles. A step-by-step method, three ready-to-use outline templates, and how to plan one with AI.",
    keywords: [
      "ebook outline",
      "ebook outline template",
      "how to outline an ebook",
      "plan a book with AI",
      "AI book writer",
    ],
    date: "2026-08-21",
    updated: "2026-10-11",
    readingMinutes: 10,
    body: `Most books that stall don't stall because of the writing — they stall because of the plan. An ebook outline is the chapter-by-chapter map of your book: what each chapter covers, why it's there, and how it leads to the next. Get it right and the writing (yours or an AI's) has somewhere to go.

Here's a method that works for guides, lead magnets, and courses, three templates you can copy, and how to use AI without ending up with a generic table of contents.

## Step 1: Write the promise in one sentence

Before any tool, finish this line: *"This book helps [who] to [do what]."*

- "This book helps first-time managers run their first 90 days without burning out."
- "This book helps Etsy sellers photograph products with a phone."

Everything in your outline must serve that promise. If a chapter doesn't, it belongs in a different book.

## Step 2: Dump what you already know

This is the step most outline guides skip, and it's the one that makes your book worth reading. Before structuring anything, collect your raw material:

- notes, voice memos, and half-written drafts,
- slides, workshop handouts, past articles or newsletters,
- the questions clients or readers actually ask you,
- examples, mistakes you've seen, and your own numbers.

Don't organise it yet. An outline built from your material produces a book only you could write. An outline built from a blank prompt produces the same ten chapters as every other book on the topic.

## Step 3: Pick the structure that fits the book

Most non-fiction ebooks follow one of three shapes. Pick one, then adapt it.

### Template 1: The how-to guide (40–120 pages)

1. **Introduction** — the problem, who the book is for, and what they'll be able to do by the end.
2. **The foundations** — the minimum concepts and vocabulary the reader needs.
3. **Step 1** … **Step N** — one chapter per stage of the process, in the order the reader will do them.
4. **Common mistakes** — what goes wrong and how to recover.
5. **Putting it together** — a worked example from start to finish.
6. **Next steps** — where to go from here, plus a checklist.

### Template 2: The lead magnet (10–30 pages)

1. **The hook** — one specific problem your audience has right now.
2. **Why the usual advice fails** — your point of view.
3. **The method** — 3–7 steps or principles, one short section each.
4. **Quick win** — one thing the reader can do today.
5. **Proof** — a short case study or example.
6. **Call to action** — the natural next step with you.

### Template 3: The course or workbook (30–100 pages)

1. **How to use this workbook**
2. **Module 1** … **Module N** — each with a goal, the lesson, an example, and an exercise.
3. **Checkpoints** — a short review after every two or three modules.
4. **Final project** — a task that uses everything from the course.
5. **Resources** — templates, checklists, further reading.

Writing fiction? A three-act structure (setup, confrontation, resolution) with a chapter list per act is the usual starting point — plus character and setting notes before you write.

## Step 4: Map your material onto the chapters

Go through your pile from Step 2 and assign every useful piece to a chapter. Then look at what's left:

- **A chapter with nothing under it** is a gap. Either you have something to say about it (write a few notes now), or it doesn't belong.
- **A pile that fits no chapter** may be a missing chapter — or material for another book.

This is the moment to be honest about gaps. Filling them later with vague filler is exactly what makes books feel generic.

## Step 5: Pressure-test each chapter

Ask three questions of every chapter:

1. **Does it earn its place?** One clear idea per chapter.
2. **Is it in the right order?** Each chapter should set up the next.
3. **Would a reader miss it?** If not, merge it or cut it.

## Step 6: Right-size the scope

A common mistake is planning a 300-page epic and finishing none of it. Decide how deep the book should go, not how many pages it should have: a quick overview, a full practical treatment, or a comprehensive reference. Then let the material decide the length — a focused 40–80 page guide often serves readers better than a padded 200-page one.

## A worked example

Promise: *"This book helps new remote team leads run effective one-on-ones."* Template: how-to guide. After mapping the author's notes:

1. Why one-on-ones fail on remote teams
2. Setting up the rhythm: frequency, length, tools
3. The first one-on-one with a new report
4. The standing agenda (with the author's own template)
5. Feedback that lands over video
6. Spotting burnout early — signals from the author's teams
7. Common mistakes, and how to recover
8. A month of one-on-ones, start to finish

Chapters 4 and 6 are where this book wins: they come from the author's real templates and experience, not from general advice.

## How to plan an ebook outline with AI

AI is genuinely good at outlining — as long as you give it something to work with. The difference is what you feed it:

- **Prompt only:** "Write an outline for a book about remote one-on-ones." You get a generic table of contents that any competitor could produce.
- **Your material:** notes, documents, and examples. The AI proposes a structure around what *you* know, and can point out where your material has gaps.

That second approach is how [${BRAND}](/ai-ebook-generator) works. You upload your notes, documents, or project files; it organises what you know and proposes a chapter blueprint, with each chapter tied to the material it draws on; and it asks a few questions where something is missing. You rename, reorder, add, or remove chapters, answer the questions, and approve. Only then does it write — chapter by chapter, from the blueprint you signed off on.

## Common outline mistakes

- **Too many chapters that say the same thing.** Merge them.
- **Front-loading theory.** Readers want the first useful step early.
- **No promise.** Without Step 1, the book drifts.
- **Planning a length instead of a depth.** Pages follow content, not the other way round.
- **Ignoring gaps.** A gap you don't fill becomes filler.

---

Stop planning in circles. [Plan your book free](/register): upload what you know and get a chapter blueprint built from your own material. When the book is done, here's [how to self-publish it](/blog/self-publish-ai-written-ebook).`,
  },
];

export const BLOG_SLUGS = BLOG_POSTS.map((p) => p.slug);

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

/** The date a post last meaningfully changed (rewrite date, else publish date). */
export function postModified(post: BlogPost): string {
  return post.updated ?? post.date;
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
