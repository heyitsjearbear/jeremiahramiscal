# 📈 RankQuest

> **Turn your own site's search performance into a game**: instrument it, snapshot the data, build a scorer that predicts where a post will land *before* you publish, then grade the prediction against what actually happened. Each module ships one working piece and ends with a way to prove it works.

---

## 📖 About This Guide

This is a **course, not a spec**. It gives you the file, the signature, the concept, and the test — you write the code.

### 🎯 Motivation

Writing consistently is hard when there's no feedback loop. Analytics dashboards are a weak one: you look at a number, feel something, and change nothing. A *game* is a strong one, because it demands a prediction before the fact and then grades you.

The pieces genuinely need each other. **Search Console** owns the search side — impressions, average position, the actual queries people typed. **GA4** owns the on-page side — engagement time, scroll, where people went next. A simulation is only a game if you can score it, and scoring needs both. So: instrument first, simulate second, gamify third.

There's a second motive worth being honest about: building this teaches you what actually moves search rankings, because you're forced to write down which factors you believe in and then watch reality disagree.

### ⚠️ Read this before you start

A personal site with a handful of posts has **sparse, noisy** Search Console data. Most queries will sit in the sub-10-impressions bucket where "average position" is nearly meaningless. The simulator will not be predictive for months.

That doesn't make this a waste — but it changes what you're building. Early on it's **a checklist with a score attached**, and the checklist items are real (meta description present, internal links, heading structure). The predictive part earns its keep later. Build it in that order and Phase 1 pays off immediately while Phase 2 accumulates data.

### 🎓 Learning Goals

| Goal | Description |
|------|-------------|
| **Analytics instrumentation** | GSC and GA4 set up correctly, linked, and gated so your own traffic doesn't pollute the data |
| **API data pipelines** | Authenticate a service account, page through an API, and store immutable snapshots |
| **Content analysis** | Walk a Portable Text tree to extract words, links, and headings from structured content |
| **Honest modelling** | Build a scorer with explicit weights, express uncertainty as a range, and refit against real outcomes |
| **Studio extensions** | Add a custom tool and a document view to Sanity Studio |
| **Statistical humility** | Recognise when your sample is too small to conclude anything — and say so in the UI |

---

## 📚 Table of Contents

- [How to Use This Guide](#-how-to-use-this-guide)
- [Where This Fits in the Codebase](#-where-this-fits-in-the-codebase)
- [Phase 1 — Instrument](#-phase-1--instrument)
  - [Module 1: Search Console](#-module-1--search-console)
  - [Module 2: GA4](#-module-2--ga4)
  - [Module 3: Link Them + Custom Events](#-module-3--link-them--custom-events)
  - [Module 4: The Snapshot Pipeline](#-module-4--the-snapshot-pipeline)
- [Phase 2 — Simulate](#-phase-2--simulate)
  - [Module 5: The Scorer](#-module-5--the-scorer)
  - [Module 6: Predictions and Grading](#-module-6--predictions-and-grading)
  - [Module 7: Refit the Weights](#-module-7--refit-the-weights)
- [Phase 3 — The Game](#-phase-3--the-game)
  - [Module 8: The Studio Tool](#-module-8--the-studio-tool)
- [Progress Tracking](#-progress-tracking)

---

## 📌 How to Use This Guide

- **Module 1 and 2 are time-sensitive.** GSC only starts collecting the day you verify the property, and none of it backfills. Every day without them is history you can never recover. Do them this week, even if you never build Phase 2.
- **Read** the *Lesson* before the assignment — the concepts (sampling, position averaging, overfitting) are what keep the later modules honest.
- **Test** each module. Analytics failures are silent by nature: nothing errors, the numbers are just wrong.
- Modules 5–8 are ordinary TypeScript and can be built while data accumulates.

---

## 🧭 Where This Fits in the Codebase

| You will write | Notes |
|---|---|
| `src/app/(site)/layout.tsx` (edit) | **There is no `src/app/layout.tsx`** — the route groups each own their layout. GA goes in the `(site)` one, so `/studio` stays untracked |
| `data/gsc/YYYY-MM-DD.json` | Immutable daily snapshots, committed |
| `data/predictions.json` | Your predictions, one per post |
| `scripts/pull-gsc.ts` | Node script, run by cron. **Not** a route in the app |
| `src/lib/seo/score.ts` | Pure scoring function — no I/O, no fetch, no `process.env` |
| `src/lib/seo/extract.ts` | Portable Text → the features the scorer needs |
| `sanity/tools/rankquest/` | The Studio tool (Module 8) |

**Conventions:**

1. **`NEXT_PUBLIC_` is a real boundary.** Anything with that prefix ships to the browser. `NEXT_PUBLIC_GA_ID` belongs there; a GSC service-account key absolutely does not.
2. **The scorer is pure.** `score(features) → result`, deterministic, no side effects. This is what makes it testable and what lets it run in Node, in the Studio, and in a page without three implementations.
3. **Snapshots are immutable.** Written once, never edited. The whole grading mechanism depends on being able to trust what you recorded on a given day.
4. **`SITE.url`** from `src/lib/site.ts` for every absolute URL.
5. **This is not the Next.js in your training data.** Check `node_modules/next/dist/docs/` before using an API you're unsure of.

---

## 📦 Phase 1 — Instrument

## 🧩 Module 1 — Search Console

### 🎥 Recommended Reading

- **[Google — Add a website property](https://support.google.com/webmasters/answer/34592)**
- **[Domain vs URL-prefix properties](https://support.google.com/webmasters/answer/34592#property_type)** — read this before choosing; switching later loses continuity.

### 🧠 Assignment: Verify the property and submit the sitemap

1. **Add a Domain property** for `jeremiahramiscal.com` at [search.google.com/search-console](https://search.google.com/search-console). Domain (not URL-prefix) covers every subdomain and both protocols, and verifies by **DNS TXT record** at your registrar — so it survives redeploys, host changes, and framework rewrites.
   - *Fallback:* if you can't edit DNS, use a URL-prefix property with the HTML meta tag, added to the `metadata` export in `src/app/(site)/layout.tsx` via the `verification.google` field. Prefer DNS.
2. **Submit the sitemap** — `https://jeremiahramiscal.com/sitemap.xml` under *Sitemaps*. It's live and currently returns 5 URLs (more once the Projects section exists).
3. **Wait 3–5 days**, then read two reports properly:
   - **Pages** — indexed vs. not indexed, *and the reason for each exclusion*. "Discovered – currently not indexed" and "Crawled – currently not indexed" mean different things and have different fixes. Learn the difference now on 5 pages rather than later on 50.
   - **Performance** — clicks, impressions, CTR, average position. Note how few queries have meaningful volume. That observation is the honest baseline for everything in Phase 2.
4. **Set up export before you need it.** GSC retains ~16 months and then drops data permanently. Either enable the **BigQuery bulk export** (Settings → Bulk data export) or plan the cron from Module 4. Decide now; the retention clock is already running.
5. **Check `robots.txt` and headers** — `src/app/robots.ts` and the `X-Robots-Tag: index, follow` in `next.config.ts` are both already correct. Confirm with GSC's URL Inspection on the home page rather than assuming.

### Test cases and instructions

- **Verified**: the property shows a green check. DNS propagation can take up to a day — don't re-verify in a loop.
- **Sitemap accepted**: status *Success*, discovered URL count matches what `curl -s https://jeremiahramiscal.com/sitemap.xml | grep -c "<url>"` returns.
- **URL Inspection** on the home page reports *URL is on Google* (or *is available to Google* if fresh). Any "blocked" verdict means a robots or header problem — fix it before doing anything else in this guide.
- **Inspect a blog post** and check the crawled page has the meta description you expect. This validates the entire metadata chain end to end.
- **A week later**: the Performance report has non-zero impressions. If it's flat zero after two weeks with pages indexed, you're not ranking for anything yet — normal for a new site, and useful to know.

### 🧩 Lesson: What "average position" actually measures

Search Console reports four metrics, and three of them are commonly misread.

**Impressions** count times a URL appeared in a result set — *not* times it was seen. A result at position 47 that nobody scrolled to still counts an impression. **Clicks** are real. **CTR** is clicks ÷ impressions, and it's only interpretable at comparable positions: 2% CTR at position 3 is dreadful, at position 25 it's remarkable.

**Average position** is the trap. It's the mean of your best-ranked position across impressions, which means it is an average over *queries you were shown for at all*. Start ranking for a new long-tail query at position 40 and your "average position" gets worse — while your traffic goes up. The metric moves against you when good things happen. Never treat it as a single number to optimise; treat it as per-query, and only for queries with enough impressions to mean something.

Two more distortions to internalise now:

**Data is thresholded.** Google omits queries below a privacy threshold. A page can show 200 impressions in the Pages report while the queries listed sum to 40. The gap is real data you're not allowed to see — so never compute a "share" from the query table.

**Position is contextual.** Rankings vary by country, device, personalisation, and time of day. The reported figure is an aggregate across all of it. Two posts at "position 12" may live in completely different competitive realities.

This is exactly why Module 5 outputs a **band** ("11–20") rather than a number. The underlying measurement isn't precise enough to justify a decimal, and a fake-precise prediction is one you can neither confirm nor learn from.

### 📚 Additional Resources

- [Search Console — Performance report reference](https://support.google.com/webmasters/answer/7576553)
- [Search Console — Page indexing report](https://support.google.com/webmasters/answer/7440203)

---

## 🧩 Module 2 — GA4

### 🎥 Recommended Reading

- Local: `node_modules/next/dist/docs/01-app/02-guides/third-party-libraries.md` — the `GoogleAnalytics` section. **Read this instead of a blog post**; the App Router details matter.
- **[GA4 — Find your Measurement ID](https://support.google.com/analytics/answer/12270356)**

### 🧠 Assignment: Install GA4 correctly

1. **Create the property** — `analytics.google.com` → Admin → **Create → Property** → **Data Streams → Web** → `https://jeremiahramiscal.com`. Leave **Enhanced Measurement ON**: you get scroll depth, outbound clicks, site search, and file downloads with zero code, and Module 3 uses several of them.
2. **Get the Measurement ID** — Admin → Data Streams → your web stream. It looks like `G-XXXXXXXXXX`. **Not** the Property ID (a bare number). The code wants the `G-` one.
3. **Install the wrapper, don't hand-roll a script tag:**
   ```bash
   npm install @next/third-parties@latest
   ```
   ```tsx
   // src/app/(site)/layout.tsx
   import { GoogleAnalytics } from '@next/third-parties/google'
   // ...as a sibling after <body>, inside <html>:
   <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
   ```
   It loads `gtag.js` after hydration and — the part a manual install gets wrong — counts App Router client-side navigations as pageviews.
4. **Env var** — `NEXT_PUBLIC_GA_ID` in `.env.local` **and** in Vercel. It's public by design; `NEXT_PUBLIC_` is correct and you should **not** mark it sensitive in Vercel.
5. **Gate to production.** Render the component only when `process.env.NODE_ENV === "production"` **and** the ID is set. Your dev refreshes are the single biggest source of garbage in a low-traffic property, and every number the game scores on comes from here.
6. **Placement matters** — it goes in `src/app/(site)/layout.tsx`. **There is no `src/app/layout.tsx`** in this repo; `(site)` and `(studio)` each own their layout. Putting it in the site layout means `/studio` is never tracked, which is what you want.
7. **No CSP to fight** — `next.config.ts` sets `X-Robots-Tag` and `X-Content-Type-Options` but no `Content-Security-Policy`, so nothing will block `gtag.js`. If you add a CSP later, remember this.
8. **Consent banner — decide, don't drift.** GA4 sets cookies. Meaningful EU traffic makes a consent banner a genuine obligation, not a nicety. A cookieless alternative (Plausible, Umami) avoids the question entirely — but GA4 is the one that links to Search Console, which is the keystone of Module 3. Most likely answer: keep GA4, add the banner. Write the decision down either way.

### Test cases and instructions

- **Dev is silent**: run `npm run dev`, open DevTools → Network, filter `gtag`. **No request.** If there is one, your production gate is wrong and you're about to poison your own dataset.
- **Prod fires**: deploy, load the site, check GA4 **Realtime**. You appear within ~30 seconds.
- **Empty Realtime?** Ad blockers eat `gtag.js`. Test in a clean browser or private window before blaming the code — this wastes more time than any other step here.
- **SPA navigation counts**: in production, land on `/`, then click through to a blog post *without* a full reload. Realtime should show **two** pageviews with different paths. One means the App Router integration isn't working — the exact failure a hand-rolled `<Script>` tag produces.
- **Studio untracked**: load `/studio` in production. No `gtag` request.
- **Missing env var**: temporarily unset `NEXT_PUBLIC_GA_ID` locally and build. The site must still build and render — never let analytics take down a page.

### 🧩 Lesson: Why the wrapper, and what `NEXT_PUBLIC_` really does

The App Router renders navigations on the client. Click a link and there's no page load, no new document, no `gtag.js` re-execution — the URL changes and React swaps the tree. A naïve `<Script src="gtag.js">` fires exactly once, on the first document, and every subsequent navigation is invisible. Your most engaged visitors — the ones who read three posts — register as one pageview. `GoogleAnalytics` from `@next/third-parties` subscribes to the router and sends a `page_view` per navigation. That is the whole reason to use it.

It also defers loading until after hydration, so a third-party script can't block your first paint. Loading behaviour is a performance decision, and third-party analytics is the most common way sites lose it.

On `NEXT_PUBLIC_`: environment variables are read at **build** time and inlined into the bundle when prefixed. Without the prefix, the variable exists only in the Node process and is `undefined` in the browser. This is a real security boundary, not a convention — `SANITY_API_READ_TOKEN` has no prefix for exactly that reason, and adding one would publish it in your JavaScript. Two consequences worth remembering: (1) a public var is *public*, so treat a Measurement ID as world-readable, which it already is; (2) changing a `NEXT_PUBLIC_` value requires a **rebuild**, not just a restart — Vercel needs a redeploy.

Finally, the dev gate. On a site with a thousand sessions a month, a hundred dev refreshes are 10% of your data and they're all bounce-in-two-seconds sessions from one location. Every engagement metric you'd later score against is skewed. Gate it on day one; you cannot retroactively remove yourself.

### 📚 Additional Resources

- Local: `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md`
- [GA4 — Enhanced measurement](https://support.google.com/analytics/answer/9216061)

---

## 🧩 Module 3 — Link Them + Custom Events

### 🧠 Assignment: The GA4 ↔ GSC link, and three events worth tracking

1. **Link the properties** — GA4 Admin → **Product Links → Search Console links** → link your GSC property, choose the web stream. This is the keystone of the whole guide: it unlocks the **Queries** dimension inside GA4, letting you ask *"which search query led to sessions that actually read to the end"* — a question neither tool can answer alone.
2. **Publish the report** — linking isn't enough. Reports → Library → the **Search Console** collection → **Publish**. Until you do, the reports exist but don't appear in the sidebar, which reads like the link failed.
3. **Custom events** — `sendGAEvent` from `@next/third-parties/google`, which requires a Client Component (`"use client"`). Add three:
   - **Resume PDF download** — on the `/resume` download link.
   - **Outbound clicks** — repo and social links. *Check first:* Enhanced Measurement already tracks outbound clicks automatically; only add a custom event if you need a dimension it doesn't give you. Don't duplicate.
   - **"Ran the WASM demo"** — on the Run button from the Projects guide, Module 8. The single most interesting engagement signal the site will have.
4. **Naming discipline** — pick a convention (`snake_case`, verb_noun: `demo_run`, `resume_download`) and write it down in this file. GA4 event names are permanent in the UI and unfixable retroactively.
5. **Mark conversions** — GA4 Admin → Events → toggle *Mark as key event* on the ones that matter. Only then do they appear in the reports you'd actually build a leaderboard from.

### Test cases and instructions

- **Link live**: the Search Console collection appears in the GA4 sidebar and shows data (allow ~48h).
- **Queries dimension works**: build a GA4 exploration with `Google organic search query` as a dimension and `Average engagement time` as a metric. Rows appear. This is the query that makes the leaderboard possible — prove it works now.
- **Events fire**: production, DevTools → Network, filter `collect`. Click the tracked element; a request with your event name appears in the payload. Then confirm in Realtime.
- **No double-counting**: click an outbound link and check you get **one** event, not both an automatic `click` and a custom duplicate.
- **Client boundary**: `sendGAEvent` in a Server Component throws at build. If it built, you put it in a client file — verify the `"use client"` is on the smallest component that needs it, not on a whole page.

### 🧩 Lesson: Why two tools, and what the link actually gives you

GSC and GA4 measure disjoint halves of the same session and neither can see the other's half.

GSC sits **before the click**. It knows the query, the position you appeared at, whether the click happened. It knows nothing after — you could bounce in a second and GSC reports a click.

GA4 sits **after the click**. It knows the landing page, engagement time, scroll depth, what you did next. It cannot see the query, because Google strips it from the referrer. That's why GA4 shows most search traffic as `google / organic` with no keyword.

Linking them lets GA4 join on the anonymised session and expose GSC's query dimension alongside its own behavioural metrics. That unlocks the question you actually care about: *not* "which post gets impressions" but **"which query brings people who read the whole thing."** A post ranking #3 for a query whose visitors leave in four seconds is a worse outcome than #15 for one whose visitors read to the end and click through to another post. Only the joined data distinguishes them, and that distinction is what Module 8's leaderboard should rank on.

The join is **not** row-level — you can't trace one person from query to scroll. It's aggregate and sampled, which is a privacy feature, not a bug. Treat it as directional.

### 📚 Additional Resources

- [GA4 — Search Console integration](https://support.google.com/analytics/answer/10737381)
- Local: `node_modules/next/dist/docs/01-app/02-guides/third-party-libraries.md` (`sendGAEvent`)

---

## 🧩 Module 4 — The Snapshot Pipeline

### 🎥 Recommended Reading

- **[Search Analytics API — `query` method](https://developers.google.com/webmaster-tools/v1/searchanalytics/query)** — read the request body fields: `dimensions`, `rowLimit`, `startRow`, `dataState`.
- **[Google Auth Library for Node](https://github.com/googleapis/google-auth-library-nodejs)**

### 🧠 Assignment: Pull GSC data into versioned JSON

1. **Service account** — Google Cloud Console → new project → enable the **Search Console API** → create a service account → download the JSON key. Then, in **Search Console** → Settings → Users and permissions, **add the service account's email address** as a *Full* user. This second step is the one everyone forgets, and its symptom is a confusing 403.
2. **`scripts/pull-gsc.ts`** — a standalone Node script, not a Next route. Signature roughly:
   ```ts
   type GscRow = {
     page: string; query: string;
     clicks: number; impressions: number; ctr: number; position: number;
   };
   async function pullRange(startDate: string, endDate: string): Promise<GscRow[]>
   ```
   Request `dimensions: ["page", "query"]`, `rowLimit: 25000`, and **page through with `startRow`** until you get fewer rows than the limit.
3. **Write immutable snapshots** — `data/gsc/YYYY-MM-DD.json`, named for the run date, containing the raw rows plus a small header (`{ pulledAt, startDate, endDate, rowCount }`). **Never overwrite an existing file.** If today's exists, exit cleanly.
4. **Mind the lag.** GSC data finalises ~2–3 days behind. Pull `endDate = today - 3` and know that a fresher pull returns partial data. If you must pull fresh, set `dataState: "all"` and *record that you did* in the header — mixing fresh and final data in one dataset silently corrupts every comparison later.
5. **Schedule it.** Two viable options:
   - **GitHub Actions** on a weekly cron, with the service-account key in repo secrets, committing the new JSON back. **Recommended** — secrets never touch the site runtime, and the data is versioned by definition.
   - **Vercel Cron** hitting a route handler. Requires the key as a Vercel env var and somewhere to write that isn't the read-only filesystem, so you'd need a store. More moving parts for no benefit here.
6. **Secrets hygiene** — the key JSON goes in `.gitignore` and nowhere near `NEXT_PUBLIC_`. Point the script at it via `GOOGLE_APPLICATION_CREDENTIALS`.
7. **A small aggregator** — `data/latest.json` derived from the newest snapshot: per-page totals (clicks, impressions, mean position weighted by impressions). This is what Modules 6–8 read, so they never parse the raw pile.

### Test cases and instructions

- **Auth works**: run the script. Rows come back. A **403** means step 1's second half — the service account isn't a GSC user.
- **Pagination works**: log the row count. If it's exactly 25000, you stopped early — your loop isn't advancing `startRow`. Verify against a lower `rowLimit` (say 10) on a range you know exceeds it.
- **Immutability**: run it twice the same day. The second run must not modify the file. Diff it to be sure.
- **Cross-check with the UI**: pick one page, sum its clicks from your JSON for a date range, compare with the Performance report filtered to that page and range. They should match closely. Mismatches usually mean date-range off-by-one or a timezone assumption.
- **Empty range**: run against a range before the property existed. Zero rows, clean exit, no crash, no empty file written.
- **Secret not committed**: `git status` after a run shows the new snapshot and **not** the key. Then `grep -rn "private_key" --include="*.json" .` outside `node_modules` returns nothing.

### 🧩 Lesson: Why snapshots, and why immutable

You could query the GSC API live whenever you need a number. Don't — for three reasons.

**Retention.** GSC keeps ~16 months and then it's gone forever. A snapshot committed to git is permanent. Module 7 wants years of history; the API will not have it.

**Reproducibility.** Grading a prediction means comparing what you predicted to what happened *as measured at a specific time*. If the source can change under you, the comparison isn't a measurement. Immutable snapshots make the grade auditable a year later — you can point at the file.

**Late-arriving data.** GSC backfills for a couple of days after the fact. A page pulled today at "position 14" may read 12.8 when pulled next week for the same date. Neither is wrong; the second is more complete. If you overwrite, you silently rewrite history and your grades become unreproducible. If you append dated snapshots, you can *see* the revision, which is itself information.

This is the append-only-log idea: raw immutable facts, derived views computed from them. `data/latest.json` is a **derived** view — deletable and rebuildable at any time. Snapshots are **source** — never edited. Keeping that line clean is what lets you change your aggregation logic later without losing anything.

One more habit: store the *request parameters* in the file header alongside the data. In six months, "was this pulled with `dataState: all`?" is unanswerable from rows alone, and it changes how you should read them.

### 📚 Additional Resources

- [Search Analytics API reference](https://developers.google.com/webmaster-tools/v1/searchanalytics/query)
- [GSC — Data discrepancies explained](https://support.google.com/webmasters/answer/7576553#data_discrepancies)

---

## 📦 Phase 2 — Simulate

## 🧩 Module 5 — The Scorer

### 🧠 Assignment: Features in, band out

1. **`src/lib/seo/extract.ts`** — turn a post document into measurable features. Portable Text is a JSON tree, so this is tree-walking, not regex-on-HTML.
   ```ts
   export type PostFeatures = {
     wordCount: number;
     titleHasQuery: boolean;
     h1HasQuery: boolean;       // the post title is the h1; body h1s are separate
     queryInFirst100Words: boolean;
     headingCount: number;
     internalLinksOut: number;
     externalLinksOut: number;
     hasMetaDescription: boolean;
     metaDescriptionLength: number;
     imageAltCoverage: number;  // 0..1
     readingMinutes: number;
   };
   export function extractFeatures(post: Post, targetQuery: string): PostFeatures
   ```
   `toPlainText` is re-exported from `@portabletext/react` (it comes from `@portabletext/toolkit`) — use it for word counts rather than writing your own flattener. Links live in `markDefs` on each block, not in the text spans; a `link` mark whose `href` starts with `/` or with `SITE.url` is internal.
2. **`src/lib/seo/score.ts`** — a **pure** function:
   ```ts
   export type ScoreResult = {
     score: number;                       // 0..100
     band: "1-3" | "4-10" | "11-20" | "21-50" | "50+";
     misses: { factor: string; message: string; weight: number }[];
     confidence: "low" | "medium";
   };
   export function scoreDraft(features: PostFeatures): ScoreResult
   ```
3. **Weights in one place** — a single exported `WEIGHTS` object. Module 7 rewrites these numbers; it must be one edit, not a hunt through conditionals.
4. **Start embarrassingly simple.** Ten locally-measurable factors, hand-picked weights, sum, map to a band. Resist adding a factor you can't measure from the draft alone.
5. **`misses` is the actual product.** "Score: 62" changes nothing. "No internal links out of this post" and "Meta description missing" are things you can go fix in the next two minutes. Sort by weight descending.
6. **`confidence` is `"low"` until Module 7 has run** with real data. Say so in the type, and later in the UI.

### Test cases and instructions

- **Unit-test the extractor** against a real post document pulled from Vision. Word count within ~5% of what your editor reports; heading count exact.
- **Link classification**: a post with one `/blog/other-post` link and one `https://github.com/...` link gives `internalLinksOut: 1, externalLinksOut: 1`. Getting this backwards is easy and quiet.
- **Empty post**: `body: []`, no seo. It returns a valid result with a low score and a full `misses` list. **Never throws.** The scorer runs on drafts, and drafts are half-empty by definition.
- **Monotonicity**: take a post, add a meta description, re-score. The score goes **up**. Do this for every factor — a factor that moves the score the wrong way is a sign error you'd otherwise ship.
- **Purity**: call it twice with identical input, deep-equal the results. No dates, no randomness, no `process.env`.
- **Sanity check on your best post**: it should score higher than your worst. If not, your weights disagree with your own judgement — trust your judgement and fix the weights.

### 🧩 Lesson: Ranges, weights, and not fooling yourself

Three ideas keep a homegrown scorer honest.

**Predict a band, not a number.** "#7" implies you can distinguish 7th from 8th. Nothing in your inputs supports that — you can't see competing pages, backlinks, domain authority, or query intent. "11–20" is a claim you can actually be right or wrong about, and being gradeable is the entire point. A prediction that can't be falsified isn't a prediction.

**Hand-picked weights are a hypothesis.** Deciding that "target query in title" is worth 15 points and "word count vs. top-10 average" is worth 10 is a statement about how you believe search works. Write them as data, not as `if` statements, and treat them as provisional. Module 7 exists to correct them.

**The measurable is not the important.** You're scoring what you can extract from a draft: keyword placement, structure, links, length. The things that actually decide rankings — is this genuinely useful, does anyone link to it, does it answer the searcher's real question — are mostly not extractable. So the scorer is a proxy, and proxies invite Goodhart's law: optimise the proxy hard enough and you degrade the thing it was standing in for. A 3000-word post stuffed with the target phrase will score well and rank badly.

The defence is to only include factors that are **good practice regardless of scoring** — a meta description helps readers in the results page, internal links help navigation, alt text helps screen readers, heading structure helps skimming. Every one of those is worth doing even if it moved no ranking at all. When you're tempted to add a factor, ask: *would I still want this if the score didn't exist?* If no, leave it out.

### 📚 Additional Resources

- [Google — SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Portable Text spec](https://github.com/portabletext/portabletext) (`markDefs` and links)
- [Wikipedia — Goodhart's law](https://en.wikipedia.org/wiki/Goodhart%27s_law)

---

## 🧩 Module 6 — Predictions and Grading

### 🧠 Assignment: Record predictions, grade them on a schedule

1. **`data/predictions.json`** — one entry per post, written when you publish:
   ```ts
   type Prediction = {
     slug: string;
     targetQuery: string;
     predictedAt: string;      // ISO date
     publishedAt: string;
     score: number;
     band: string;
     weightsVersion: string;   // which WEIGHTS produced this
     features: PostFeatures;   // snapshot — weights change, this must not
   };
   ```
   Storing the features (not just the score) is what makes Module 7 possible.
2. **`weightsVersion`** — bump it whenever you change `WEIGHTS`. Grading a prediction made under v1 against v3's weights is comparing nothing to nothing.
3. **`scripts/grade.ts`** — for each prediction, find the post's actual mean position from the snapshot nearest to +7, +30, and +90 days after `publishedAt`. Emit:
   ```ts
   type Grade = {
     slug: string; horizon: 7 | 30 | 90;
     predictedBand: string;
     actualPosition: number | null;   // null = insufficient impressions
     actualBand: string | null;
     hit: boolean | null;
     impressions: number;
   };
   ```
4. **Refuse to grade thin data.** Under ~10 impressions in the window, `actualPosition` is `null` and `hit` is `null`. **Not** `false`, and not a guess. Counting no-data as a miss will teach you the wrong lesson from your own game — this is the single most important line in the module.
5. **Weight the average.** Mean position across a window must be weighted by impressions per day. An unweighted mean lets one impression on a quiet Tuesday outvote four hundred on a busy Monday.
6. **Output `data/grades.json`** — derived, regenerable, safe to delete.

### Test cases and instructions

- **Synthetic prediction**: hand-write one for an existing post with a band you know is wrong. Grading marks it a miss. Then edit to the correct band; it becomes a hit. Prove both directions.
- **No-data path**: predict for a post with zero impressions. `hit: null`, and it is **excluded** from any accuracy percentage you print.
- **Boundary**: an actual position of exactly 10.0 against band `4-10`. Decide inclusive or exclusive, write it in a comment, test it. Off-by-one at band edges is the bug you'll otherwise hit later and misdiagnose as a data problem.
- **Missing snapshot**: no snapshot near +30 for some post. Skip that horizon cleanly; don't reach for the nearest available and pretend.
- **Weighted vs unweighted**: compute both on one post with lumpy traffic. They should differ. If they don't, your weighting isn't applied.

### 🧩 Lesson: What makes it a game rather than a dashboard

A dashboard shows you numbers. A game requires a **commitment before the outcome** and then settles it. That single structural difference is what produces learning: you're forced to make your beliefs explicit, and then reality tells you which were wrong. Without the pre-commitment, you'll read every result as confirming what you already thought — hindsight bias is not something you can discipline your way out of, you can only design around it.

This is why the prediction must be **timestamped and immutable**. A prediction you can edit after seeing the result is a diary entry.

The `null` for thin data is a statistics point, not a UX nicety. With 3 impressions, "average position 8.3" is one person's personalised result on one device. Treating that as a hit or a miss injects pure noise into the signal you're trying to build, and Module 7 will happily fit to that noise. **Honest missing data beats a confident guess.** You will feel the pull to fill in the blanks — every dashboard you've used does it. Don't.

Multiple horizons exist because rankings genuinely evolve. New pages often get a temporary boost, then settle; others take months to climb as they accumulate signals. A +7 grade measures your prediction of the *initial* placement, +90 measures the *settled* one. They can disagree, and the disagreement is informative — if you're consistently right at 7 days and wrong at 90, you're modelling freshness, not quality.

### 📚 Additional Resources

- [Philip Tetlock — *Superforecasting*](https://en.wikipedia.org/wiki/Superforecasting) (the case for calibrated, gradeable predictions)
- [Brier score](https://en.wikipedia.org/wiki/Brier_score) — if you later want probabilistic predictions instead of bands

---

## 🧩 Module 7 — Refit the Weights

### 🧠 Assignment: Let the data correct you (once there's enough)

1. **Wait for ~20 graded predictions** with non-null actuals. Fewer than that and you're fitting noise. This is a real wait — likely many months. Build the script now, run it later.
2. **`scripts/refit.ts`** — load graded predictions with their stored `features`, run an ordinary least-squares fit of features → actual position. A tiny hand-written normal-equations solver, a small matrix library, or honestly a spreadsheet — all fine. This is not a machine learning project.
3. **Read the coefficients as findings.** A near-zero coefficient means that factor didn't matter *on your site, for your queries*. A sign-flipped one means it hurt. Both are interesting and both are worth a blog post.
4. **Regularise by hand.** With 20 samples and 10 features you are absolutely overfitting. Two guards: drop features whose coefficient is small relative to its variation, and **blend** — new weight = 50% fitted, 50% prior. Don't hand the model the wheel.
5. **Version it** — bump `weightsVersion`, keep the old weights in the file with a date. You want to be able to ask "did v2 predict better than v1?"
6. **Report accuracy honestly** — hit rate over *gradeable* predictions, with the denominator shown: "7/11 gradeable (9 excluded: insufficient data)". A bare "64%" hides the thing that most affects how much you should believe it.

### Test cases and instructions

- **Known-answer test**: fabricate 30 synthetic predictions where position is exactly `50 - 2 × wordCountHundreds` plus small noise. The fit should recover ≈ -2 for that feature and ≈ 0 for the rest. If it doesn't, the solver is wrong and you'd never know on real data.
- **Refuses small samples**: with 5 graded predictions the script declines to refit and says why.
- **Blending applied**: a fitted weight of 40 against a prior of 10 yields 25, not 40.
- **Version bump**: after refitting, new predictions carry the new `weightsVersion` and old grades still reference the old one.
- **Improvement check**: re-grade historical predictions under the new weights. If accuracy *drops*, keep the old weights and write down that it happened.

### 🧩 Lesson: Overfitting, and the smallest honest model

With 20 data points and 10 features, a linear model has enough freedom to fit your data almost exactly — including all the noise. It will look excellent on the data it learned from and be useless on the next post. That's overfitting, and at this sample size it's not a risk to watch for, it's the default outcome.

Three defences, in order of how much they help here:

**Fewer features.** The usual rule of thumb wants ~10 observations per feature. With 20 observations, that's *two* features. Fitting three or four while holding the rest at their priors is far more defensible than fitting ten.

**Shrinkage toward the prior.** Blending fitted weights with your hand-picked ones is ridge regression by hand. It says "the data nudges my belief, it doesn't replace it," which at n=20 is exactly right.

**Hold something out.** Fit on the first 15 chronologically, test on the last 5. Worse on the held-out set than the fitted set? That gap *is* your overfitting, measured.

There's a deeper limit worth stating plainly: your features probably explain a genuinely small share of ranking variance. Domain authority, backlinks, competitor quality, and query intent dominate, and none are in your dataset. A model that explains 15% of variance is not a failed model — it's an accurate description of how much of the outcome is visible from where you're standing. The failure mode is claiming more.

Which loops back to the honest framing from the top of this guide: for a long while, this is a well-instrumented checklist with a score attached. That's a genuinely useful thing. Just don't let a fitted coefficient talk you into believing it's an oracle.

### 📚 Additional Resources

- [Wikipedia — Overfitting](https://en.wikipedia.org/wiki/Overfitting)
- [StatQuest — Regularization (Ridge)](https://www.youtube.com/watch?v=Q81RR3yKn30)

---

## 📦 Phase 3 — The Game

## 🧩 Module 8 — The Studio Tool

### 🎥 Recommended Reading

- **[Sanity — Custom tools](https://www.sanity.io/docs/studio-tools)**
- **[Sanity — Custom document views](https://www.sanity.io/docs/custom-document-views)**
- **`sanity.config.ts`** — the existing `structureTool` and `visionTool` entries show where a plugin goes.

### 🧠 Assignment: Put the score where you write

1. **Where it lives:** the Studio. You're already there when writing, and a pre-publish score belongs next to the draft, not in a tab you'll never open. (The alternatives — a private `/dashboard` behind auth, or a local CLI over the JSON — are more work for less use.)
2. **Pre-publish score** — a **document view** on the `post` type, alongside the editor. It reads the current (draft) document, runs `extractFeatures` + `scoreDraft`, and shows the score, the band, and the `misses` list. Because the scorer is pure and has no Node dependencies, it runs unchanged in the browser. That's the payoff for keeping it pure in Module 5.
3. **Target query input** — the scorer needs one. Add a `targetQuery` string field to the `post` schema (inside the existing `seo` object, collapsed) rather than a floating input in the tool. It's content, it belongs on the document.
4. **Leaderboard** — a **tool** (its own icon in the Studio top bar) listing published posts ranked by GSC clicks and GA4 engagement time, read from `data/latest.json`. Simplest workable path: import the JSON at build time. If that gets stale, serve it from a route handler and fetch it.
5. **Prediction accuracy** — a panel in the same tool: hit rate, the gradeable denominator, and a per-post list of predicted vs. actual. This is the score *you* are playing for.
6. **Streaks and quests** — publish cadence, "every post has a meta description," "no orphan posts (every post has ≥1 inbound internal link)." Compute them from Sanity + the snapshots.
7. **The rule for quests:** only reward things that genuinely help. A quest for "add the target query 5 times" is a quest to write worse. Every quest must survive the Module 5 test — *would I want this if there were no score?*

### Test cases and instructions

- **View appears**: open a post in `/studio`; your view is a tab next to the editor.
- **Live update**: type into the body. Word count and score update as the draft changes (debounce it — scoring on every keystroke is jarring).
- **Empty draft**: open a brand-new post. Score renders, full `misses` list, no crash.
- **Misses are actionable**: fix one of them in the editor and watch it disappear from the list. If it doesn't, the view is reading the published document instead of the draft.
- **Leaderboard matches reality**: spot-check the top post against the GSC Performance report. Numbers agree.
- **Accuracy shows its denominator**: with 2 graded and 9 ungraded predictions, the UI says so rather than printing "50%".
- **Studio still builds**: `npm run build`. A broken Studio plugin fails the whole site build — this is the one place a bug here takes down production.

### 🧩 Lesson: Feedback at the point of decision

A metric changes behaviour only if it arrives when a decision is still open. GA4 tells you a post underperformed three months after you could have done anything about it. A score on the draft, next to the Publish button, arrives while the cost of acting is a two-minute edit. Same information, incomparable value — and this is why the Studio beats a dashboard, regardless of which is nicer to build.

The design consequence: the pre-publish panel should be **specific and few**. Three concrete misses ranked by weight beats twelve ranked by nothing, which people learn to ignore. A number alone is the worst option — it produces anxiety without direction.

Two failure modes to design against, and both are real:

**Gaming yourself.** Once a score exists, you will optimise for it, including at 11pm when you want the number to go up. This is why every quest must be defensible on its own merits — you're pre-committing to a metric you'd be happy to game.

**Score paralysis.** A publish button that feels blocked by an imperfect score means fewer posts, and fewer posts is strictly worse than imperfect posts. Frame it as *advisory*: show the misses, never gate publishing, and consider showing the score only after the body has some minimum length so early drafts aren't scolded.

Finally, note what the whole system optimises for. Rank is downstream of writing that's worth reading. The game's honest job is to stop you shipping avoidable mistakes — a missing meta description, an orphaned post, an image with no alt text — not to tell you whether the post was any good. It cannot tell you that. Keep the game in its lane and it stays useful; let it grade quality and it becomes a machine for producing content that scores well and gets read by nobody.

### 📚 Additional Resources

- [Sanity — Studio customization](https://www.sanity.io/docs/customization)
- [Sanity — `useFormValue` hook](https://www.sanity.io/docs/studio-react-hooks) (reading the live draft inside a view)

---

## 📊 Progress Tracking

**Phase 1 — Instrument** ⚠️ time-sensitive
- [ ] Module 1: Search Console verified, sitemap submitted, export planned
- [ ] Module 2: GA4 installed via `@next/third-parties`, gated to production, verified in Realtime
- [ ] Module 3: GA4 ↔ GSC linked and published, custom events firing
- [ ] Module 4: `scripts/pull-gsc.ts` + first snapshot committed + cron scheduled

**Phase 2 — Simulate**
- [ ] Module 5: `extractFeatures` + pure `scoreDraft`
- [ ] Module 6: `data/predictions.json` + `scripts/grade.ts`
- [ ] Module 7: `scripts/refit.ts` (build now, run at ~20 graded predictions)

**Phase 3 — The Game**
- [ ] Module 8: Studio document view (pre-publish score) + tool (leaderboard, accuracy, quests)

---

## 🎓 Learning Outcomes

| Area | Mastery |
|---|---|
| **Analytics** | GSC and GA4 configured correctly and linked, with an understanding of what each metric does and doesn't measure |
| **Data engineering** | Service-account auth, paginated API pulls, immutable snapshots, derived views |
| **Content analysis** | Extract structural features from a Portable Text tree rather than scraping rendered HTML |
| **Modelling** | Hand-weighted scoring, band predictions, OLS refitting, and the discipline to shrink toward a prior |
| **Statistical honesty** | Refuse to grade thin data, show denominators, and state what a model can't see |
| **Studio extensions** | Custom document views and tools that put feedback at the point of decision |

---

## 💡 Tips for Success

- **Do Modules 1 and 2 this week.** Everything else can wait; those two can't. Data doesn't backfill.
- **Gate GA4 to production on day one.** You cannot retroactively remove your own dev traffic.
- **Snapshots are append-only.** The moment you overwrite one, grading stops being auditable.
- **`null` is a valid answer.** Thin data graded as a miss teaches you the wrong lesson from your own game.
- **Keep the scorer pure.** It's what lets one implementation run in Node, in the Studio, and in a page.
- **Only score things worth doing anyway.** If you wouldn't want the behaviour without the score, it doesn't belong in the model.
- **Write the post about what you find.** "I built a ranking simulator for my own blog and here's what the coefficients said" is better content than anything the simulator will tell you to write.

---

**Instrument first, simulate second, gamify third. 📊**
