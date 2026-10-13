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
  /**
   * Exact <title> tag, used as-is (no "· Scrivetta" suffix). Set it when the
   * search title should differ from the on-page <h1> or must stay ≤60 chars.
   */
  metaTitle?: string;
  /**
   * Post body as Markdown. Two authoring aids, both handled by the page:
   * a `<!-- cta -->` line places the mid-article call to action there, and any
   * other HTML comment is an author note — stripped before rendering, never shipped.
   */
  body: string;
  /**
   * Short FAQ rendered at the end of the article and emitted as FAQPage
   * JSON-LD. Answers are plain text so the schema matches the page verbatim.
   */
  faq?: { q: string; a: string }[];
  /** Overrides the default call to action (mid-article box + closing block). */
  cta?: BlogCta;
};

export type BlogCta = {
  heading: string;
  /** Word in `heading` to set in the italic brass accent, as on the landing. */
  accent?: string;
  text: string;
  label: string;
  href: string;
};

/** The call to action posts use unless they set their own. */
export const DEFAULT_CTA: BlogCta = {
  heading: "Turn what you know into a finished ebook",
  accent: "finished ebook",
  text: `${BRAND} maps your notes into a chapter blueprint, then writes, edits, and typesets the book. Planning is free.`,
  label: "Plan your book free",
  href: "/register",
};

// UTM-tagged signup link for this article's CTAs, so signups it drives can be
// told apart in analytics.
const EBOOK_TIME_SIGNUP =
  "/register?utm_source=blog&utm_medium=article&utm_campaign=ebook-time";

// Newest first — this is also the display and sitemap order.
export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-long-does-it-take-to-write-an-ebook",
    title: "How Long Does It Take to Write an Ebook? (And How to Test the Idea First)",
    metaTitle: "How Long Does It Take to Write an Ebook? (Too Long)",
    description:
      "Weeks of writing for a book that might not sell. Here's the honest time cost, and how to test your ebook idea in one evening with notes you already have.",
    keywords: [
      "how long does it take to write an ebook",
      "write an ebook fast",
      "test an ebook idea",
      "turn your notes into an ebook",
    ],
    date: "2026-10-13",
    readingMinutes: 8,
    cta: {
      heading: "Test your ebook idea tonight",
      accent: "tonight",
      text: "Upload the notes or project you already have and get a chapter blueprint built from it. The blueprint is free; you only pay if you generate the book.",
      label: "Test your ebook idea tonight",
      href: EBOOK_TIME_SIGNUP,
    },
    faq: [
      {
        q: "How long does it take to write an ebook?",
        a:
          "Written the traditional way, a short practical ebook of 60 to 100 pages usually takes several weeks of part-time work: outlining, drafting, editing, and formatting. " +
          "Four to five weeks is a common estimate, and it often runs longer around a full-time job. " +
          "Starting from material you already have and an AI draft changes the math: in my own test, Scrivetta generated a 300+ page book from a Spring Boot project in about 30 minutes. Reading and editing it is where your time goes.",
      },
      {
        q: "How do I know if my ebook idea will sell?",
        a:
          "Show people something concrete (a title, a one-sentence promise, a table of contents, and ideally a sample chapter) and ask for a real commitment: a pre-order, a payment, or a request for early access. " +
          "Compliments are not a signal. People asking when they can get it, or paying for it, are.",
      },
      {
        q: "Can I turn a code project into an ebook?",
        a:
          "Yes. Upload the project as a ZIP and Scrivetta reads the code, configuration, build files, and docs, and skips dependency folders, build output, binaries, lockfiles, and likely secret files such as .env and private keys. " +
          "The chapters are then written around your project's real code and names, not generic examples.",
      },
      {
        q: "What does Scrivetta cost to try?",
        a:
          "Building the chapter blueprint from your material is free: creating an account, uploading files, answering the questions, and seeing the length estimate. You pay only when you generate the book itself.",
      },
    ],
    // Author notes inside the body are HTML comments: the page strips them, so
    // TODOs and future-link placeholders never reach the rendered article.
    body: `**The honest answer:** written the traditional way, a short nonfiction ebook takes most people four to five weeks of evenings and weekends. Often more.

Then you publish it. And quite often nobody buys it. Or one person does, and you're fairly sure it was a friend.

That second part is what this article is about. If you're a developer, coach, consultant, or teacher who has been "about to write an ebook" for a year, writing speed isn't really what's stopping you.

## How long does it really take to write an ebook?

Take a typical practical ebook: 60 to 100 pages, somewhere around 15,000 to 25,000 words. Here's roughly where the time goes if you have a day job:

- **Outline:** a few evenings deciding what goes in and in what order.
- **First draft:** if you write for an hour a night and keep 500 to 800 words of it, the draft alone is about a month of nights.
- **Editing:** at least one full rewrite, usually two. Another week or two.
- **Formatting:** a table of contents, a cover, and a PDF that doesn't look homemade. A weekend, if it goes well.

These are working numbers, not a study, so plug in your own pace. But the shape is the same for almost everyone: four to five weeks is the optimistic version. Add a busy month at work and a few nights staring at chapter three, and it becomes two or three months.

## Why most ebooks don't sell

Usually not because they're badly written. The common reasons are more boring:

- **Nobody asked for this exact book.** The author picked the topic they find interesting, not the problem readers would pay to solve.
- **The promise is vague.** "A guide to Spring Boot" competes with the whole internet. "Build a working shop backend in Spring Boot, from empty repo to deployed API" gives a specific person a reason to buy.
- **Nobody saw it.** The book launched to an audience of zero, and the author took the silence as an answer.

None of these get fixed by writing faster, or even by writing better. They get fixed by finding out early.

## The real problem isn't writing speed

Here's what the traditional process actually does: it makes you pay weeks of your life for one piece of information. *Will anyone buy this?*

And it only gives you the answer at the very end, after all the cost is paid. That's why the book keeps getting postponed. When finding out costs five weeks, "I'll do it when I have a quiet month" sounds reasonable. The quiet month doesn't come.

## What waiting actually costs you

It's easy to think that not writing the book costs nothing. It does cost something, just quietly:

- **Your knowledge earns nothing in a folder.** The workshop notes, the docs you wrote for your team, the project you spent a year building, the answers you keep retyping for clients. All of it is already useful to someone, and none of it is for sale.
- **Someone who knows less is already selling it.** Search your topic on Amazon or Gumroad. You'll likely find a book written by someone with less experience than you. Not because they're better, but because they shipped.
- **You learn nothing while you wait.** The first version of a book teaches you what readers actually want, and that's what makes the second version good. Every month you postpone, you skip that lesson.

<!-- cta -->

## How to test an ebook idea before you write it

The fix isn't to write faster. It's to make being wrong cheap. If testing an idea costs one evening instead of five weeks, you can afford to be wrong.

1. **Write the promise in one sentence.** "This book helps [who] to [do what]." If you can't finish that sentence, no amount of writing will save the book.
2. **Gather what you already have.** Notes, docs, slide decks, a project repository, long answers you've written in Slack or email. You have written more of this book than you think.
3. **Get a table of contents built from that material.** This is the cheapest test there is. A list of chapter titles tells a reader exactly what they'd get, and it takes you minutes to share.
4. **Turn it into a first version.** Not the final book. Something real enough that a person can read a sample chapter and decide whether they want the rest.
5. **Put it in front of people.** Share it where your readers already are: your newsletter, LinkedIn, a community you're part of, your clients. Offer early access at a low price, or a free copy in exchange for feedback.
6. **Watch what people do, not what they say.** "Cool idea!" is noise. Someone asking when they can get it, paying for early access, or asking about a specific chapter: that's signal.

If nobody bites, you lost an evening, not five weeks. If people do bite, you know which book to make properly, and you already have readers waiting for it.

## Turn your notes into an ebook with ${BRAND}

I built [${BRAND}](/) because I had exactly this problem: plenty of material, and a book I kept not writing. <!-- TODO(author): add one or two sentences of your own story here: what you knew, why the book never got written. -->

**What you give it**

- **A short brief:** your topic, who the book is for, what it should help them do, the style, and the language.
- **Your material:** PDF, DOCX, TXT, or Markdown files, pasted notes, or a whole project as a ZIP. With a code project, ${BRAND} reads the code, config, build files, and docs, and skips dependency folders, build output, binaries, lockfiles, and likely secret files such as \`.env\` and private keys.
- **A depth:** Quick, Standard, or Comprehensive. There's no page-count box. ${BRAND} estimates the length from your material and the depth, and shows you that estimate before anything is written.

**What happens before a word is written**

- It pulls out what your material actually contains: topics, processes, examples, your decisions and mistakes, and the order you did things in.
- It proposes a chapter blueprint, with each chapter tied to the material it draws on. You rename, reorder, add, or remove chapters.
- Where your material has gaps, it asks you a few questions. Skip one and that part stays general; it isn't filled with made-up details.

This whole step is free. That makes the blueprint a test in itself: a table of contents built from your own work, ready to show people before you pay for anything.

**What happens when you generate**

- The book is written chapter by chapter, using your project's real code and names. Each chapter knows what earlier chapters covered, so it refers back instead of explaining the same thing twice.
- An editing pass then reads each chapter against the whole book, looking for repetition, contradictions, and filler.
- If the book turns out noticeably longer than the length you agreed to, generation pauses and asks you whether to continue, keep it shorter, or cancel.

**What you get**

- A typeset 6×9 inch PDF with a cover, a table of contents, and embedded fonts. Code is set in monospace, and lines too long for the page are carried over visibly instead of breaking silently.
- A quality report listing anything that needs a look, by chapter and page.
- An editor where you can rewrite text, add, remove, or reorder chapters, place images, and change the cover. The PDF is rebuilt with your changes.

More detail is on the [AI ebook generator page](/ai-ebook-generator).

## Where AI drafts fall short, and how to fix it

Here's the honest part. If you type a topic, click generate, and publish the result, you'll get a book that reads like every other book on the subject. Readers notice, and they don't come back.

An AI draft works when it carries your fingerprints:

- **Your projects** as the worked examples, not made-up ones.
- **Your mistakes**, and what they cost you.
- **Your opinions:** where you think the usual advice is wrong, what you'd do differently.
- **Facts you've checked.** Every number, name, and claim.

That's why the material you upload matters more than the prompt you type. And it's why the first version is a test, not the product. Use it to find out whether people want the book, then put your real effort into the version they asked for. If you plan to sell on Amazon, read [whether you can publish a book written by AI](/blog/can-you-publish-a-book-written-by-ai) first; it covers disclosure and copyright.

## Case study: a 300-page Spring Boot ebook from a real shop backend

<!-- TODO(author): replace every [BRACKETED] placeholder below with real data. Never estimate. -->

I tested this on my own material: a shop backend I built in Spring Boot. [SHORT DESCRIPTION: what the shop does, the stack, what's in the repo.]

**What I put in:** the project as a ZIP, [OTHER MATERIAL: notes or docs, if any], and this brief:

<figure class="post-figure post-figure--todo">
  <div class="post-figure__placeholder">[SCREENSHOT: input]</div>
  <figcaption>The brief and source material I gave ${BRAND}.</figcaption>
</figure>
<!-- When the screenshot is ready, replace the placeholder div above with:
<img src="/blog/how-long-does-it-take-to-write-an-ebook/input.png" alt="Scrivetta's new-ebook form filled in for a Spring Boot shop backend book, with the project ZIP uploaded as source material" width="1440" height="900" loading="lazy" decoding="async">
(save the file to public/blog/how-long-does-it-take-to-write-an-ebook/, set the real width/height, and remove post-figure--todo from the figure) -->

**How long it took:** about 30 minutes of generation, for a book of more than 300 pages. Then [TIME SPENT EDITING] of my own reading and editing.

That's a big book on purpose: a whole backend is a lot of material. A test version doesn't need to be anywhere near that size.

**What came out:** a [EXACT PAGE COUNT]-page PDF with [NUMBER OF CHAPTERS] chapters.

<figure class="post-figure post-figure--todo">
  <div class="post-figure__placeholder">[SCREENSHOT: output PDF]</div>
  <figcaption>Pages from the finished PDF.</figcaption>
</figure>
<!-- When the screenshot is ready, replace the placeholder div above with:
<img src="/blog/how-long-does-it-take-to-write-an-ebook/output-pdf.png" alt="Pages from the generated Spring Boot ebook PDF: cover, table of contents and an opening chapter page" width="1440" height="900" loading="lazy" decoding="async"> -->

**What I changed by hand:** [WHAT YOU EDITED: which examples you added, what you cut, what you rewrote.]

**What happened when I showed it to people:** [RESULT: who saw it, and what they did.]

<!-- TODO(author): once a full case study exists, link it here, e.g. [the full Spring Boot case study](/blog/spring-boot-ebook-case-study). -->
<!-- TODO(author): future case-study links: a coach's or consultant's ebook from client notes; a teacher's ebook from course material. -->

## The short version

Writing an ebook the traditional way takes weeks, and you only learn whether anyone wants it at the end. Flip the order. Build a table of contents and a rough first version from what you already know, show it to the people it's for, and let their response tell you whether to spend the weeks.

For the full process from idea to published book, read [how to write an ebook with AI](/how-to-write-an-ebook-with-ai), or browse more guides on the [${BRAND} blog](/blog). If you'd rather find out tonight, [test your ebook idea with ${BRAND}](${EBOOK_TIME_SIGNUP}).`,
  },
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
