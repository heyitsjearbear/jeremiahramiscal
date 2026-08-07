# TODO — jeremiahramiscal.com

**Status:** shipped and live. `jeremiahramiscal.com` serves from Vercel, all routes 200, Studio works in prod. Verified 2026-08-07.

What's left is **writing** and three small config items. The infrastructure is done.

---

## 🔴 Do now

- [ ] **Rotate `SANITY_API_READ_TOKEN`** — it was shown in chat repeatedly; treat as leaked. `sanity.io/manage → API → Tokens`, then update `.env.local` **and** Vercel. Only real risk item on this list.
- [ ] **Google Search Console + GA4** — you're live, so every day without these is history you can never backfill. See below.
- [ ] **`/public/resume.pdf`** — currently **404 in prod**; the "Download PDF ↓" link on `/resume` is dead. Export and drop it in.

---

## ⬜ Content (you, in `/studio`)

- [ ] **Write real posts** — one post exists (`my-first-blog`). This is the whole point of the site.
- [ ] **Finish the Resume singleton** — 1 section with 4 items, but the section **title is empty**, so `/resume` renders a headless block. Fill it, add the rest.
- [ ] **`seo.metaDescription`** — not set on the one existing post. This is the text Google shows in results. Fill it on anything you care about ranking.
- [ ] **Confirm `/public/default-og.png`** — it's a real 1200×630, but still the near-black placeholder with an accent bar. Fine to ship, worth replacing.

---

## ⬜ Optional polish

- [ ] **Email + RSS in the sidebar** — `SOCIAL_LINKS` in `src/components/SidebarNav.tsx` has 6 real socials, no `email` or `rss` entry. `/feed.xml` works and is linked in `<head>`; adding a visible link is a choice, not a bug.
- [ ] **`SITE.description`** in `src/lib/site.ts` — confirm it's the one-liner you want. It's the fallback meta description sitewide.

---

## ⬜ Planned — Projects section (+ playable C++/WASM demos)

> **Build guide:** [`docs/projects-section.md`](docs/projects-section.md) — 9 modules, AlgoQuest-style. Concepts, signatures, and test cases; you write the code.

Not built. No `projects` schema, no `/projects` route, no nav item. Waiting on the C++ CLI tool in its separate repo.

### Phase A — the section (doesn't wait on the C++ project)
- [ ] **`projects` schema** — `sanity/schemaTypes/project.ts`, registered in `index.ts`. Fields: `title`, `slug`, `summary`, `body` (reuse `PortableBody`), `tech[]`, `repoUrl`, `liveUrl`, `coverImage`, `status` (wip/shipped/archived), `featured`, `startedAt`/`shippedAt`, `seo` (same object `post` uses), plus `demo` (Phase B).
- [ ] **Routes** — `src/app/(site)/projects/page.tsx` + `projects/[slug]/page.tsx`. Mirror the blog: `generateStaticParams`, `generateMetadata` off `seo` → `summary` → root default, same dev/prod `revalidate` split (`0`/`3600`).
- [ ] **Queries + `ProjectCard`** — add to `sanity/lib/queries.ts`.
- [ ] **Nav** — `{ label: "Projects", href: "/projects" }` in `NAV_ITEMS`, after Writing.
- [ ] **Studio structure** — Projects list in `sanity.config.ts`, ordered `featured` then `shippedAt desc`.
- [ ] **SEO** — `src/app/sitemap.ts`: `/projects` 0.7, `/projects/[slug]` 0.8. Consider `SoftwareSourceCode` JSON-LD.

### Phase B — the WASM demo
In the C++ repo:
- [ ] Emscripten SDK; `emcc` in place of `g++`. `emcc main.cpp -o tool.js -s NO_EXIT_RUNTIME=1 -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap"]'`. Look at **twr-wasm** — it wires stdin/stdout/stderr for shell-style C++ so you don't hand-roll it.
- [ ] Emit artifacts into `public/demos/<slug>/`. Copy step or submodule — don't vendor the C++ source here.

Here:
- [ ] `src/components/WasmTerminal.tsx` — **xterm.js**, `"use client"`, `next/dynamic` with `ssr: false` (xterm touches `window`).
- [ ] Load `tool.js` at runtime, pipe xterm ↔ C++ stdio. Set `locateFile` so the glue finds `tool.wasm`.
- [ ] `demo` object on the project doc (`kind: 'wasm-terminal'`, `basePath`, `entryScript`) — render the terminal only when a demo exists.
- [ ] Lazy-load behind a "run it" button; don't ship the `.wasm` on page load.
- [ ] **Verify** Vercel serves `.wasm` as `application/wasm` (`curl -I`) rather than assume.
- [ ] Only if the build uses pthreads/SharedArrayBuffer: `COOP: same-origin` + `COEP: require-corp`, **scoped to demo routes only** — they'll interact with the existing security headers.
- [ ] No-WASM fallback: usage docs + repo link, not a dead terminal.

---

## ⬜ Planned — The SEO game (GSC + GA4 + a ranking simulator)

> **Build guide:** [`docs/seo-game.md`](docs/seo-game.md) — 8 modules across instrument → simulate → gamify. Modules 1–2 are time-sensitive; data doesn't backfill.

Turn the site's own search performance into a game: a score, a leaderboard of posts, and a simulator that predicts where a post will land *before* publishing — then grades the prediction against what actually happened.

**Why the pieces hang together:** GSC has the search side (impressions, average position, actual queries). GA4 has the on-page side (engagement time, scroll, internal-link flow). A simulation is only a game if you can grade it, and grading needs both. Instrument first, simulate second.

### Phase 1 — Instrument ⚠️ do this now, it's the only time-sensitive part

**Search Console**
- [ ] Add the property. Prefer **Domain** (`jeremiahramiscal.com`) over URL-prefix — covers every subdomain/protocol and verifies by DNS TXT at your registrar, so it survives redeploys. URL-prefix + HTML meta tag is the fallback (add to `metadata` in `src/app/(site)/layout.tsx` — note: **there is no `src/app/layout.tsx`**, the route groups each own their layout).
- [ ] Submit `https://jeremiahramiscal.com/sitemap.xml`. It's live and correct (5 URLs).
- [ ] Wait 3–5 days → check **Pages** (indexed vs. excluded, and *why*) and **Performance**.
- [ ] Set up export early — GSC retains ~16 months and the simulator wants history. BigQuery bulk export, or a cron pulling the Search Analytics API into JSON in this repo. **Do this before you have data worth keeping.**

**GA4**
- [ ] Create the property: `analytics.google.com` → Admin → **Create → Property** → **Data Streams → Web** → `https://jeremiahramiscal.com`. Leave **Enhanced Measurement ON** (scroll, outbound clicks, site search, file downloads — free, no code).
- [ ] Copy the **Measurement ID** (`G-XXXXXXXXXX`, at Admin → Data Streams → the web stream). Not the Property ID (a bare number) — the code wants the `G-` one.
- [ ] Install — Next ships a first-party wrapper; don't hand-roll a `<Script>` tag:
  ```bash
  npm install @next/third-parties@latest
  ```
  ```tsx
  // src/app/(site)/layout.tsx
  import { GoogleAnalytics } from '@next/third-parties/google'
  // ...sibling after <body>:
  <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
  ```
  Loads `gtag.js` after hydration and counts App Router client-side navigations as pageviews — the thing a manual install gets wrong. Verified against `node_modules/next/dist/docs/01-app/02-guides/third-party-libraries.md`. No CSP header in `next.config.ts`, so nothing will block it.
- [ ] `NEXT_PUBLIC_GA_ID` in `.env.local` **and** Vercel. Public by design (it ships to the browser) — `NEXT_PUBLIC_` is correct, **don't** mark it sensitive.
- [ ] **Gate to production** (`process.env.NODE_ENV === 'production'`) or your own dev traffic pollutes every number the game scores on.
- [ ] Verify in GA4 **Realtime**. If empty: ad blockers eat `gtag.js` — test in a clean browser before blaming the code.
- [ ] **Link GA4 ↔ Search Console** — GA4 Admin → **Product Links → Search Console links**. This is the keystone: it unlocks the *Queries* dimension inside GA4, so you can ask "which query led to sessions that actually read to the end" — which neither tool answers alone. Then publish the report (Reports → Library → Search Console collection → Publish).
- [ ] Custom events via `sendGAEvent` (needs `"use client"`): resume PDF download, outbound repo/social clicks, and later "ran the WASM demo." Secondary scoring signals.
- [ ] Decide on a consent banner. GA4 sets cookies; meaningful EU traffic makes this a real obligation. A cookieless alternative (Plausible/Umami) avoids it — but GA4 is the one that links to GSC, so probably keep GA4 and add the banner.

### Phase 2 — The simulator
- [ ] **Start embarrassingly simple**, let real data correct it. Score a draft on locally-measurable factors: target query in title / H1 / first 100 words, word count vs. the top-10 average, internal links in and out, heading structure, `seo.metaDescription` present and under ~155 chars, image alt coverage, reading time. Output a **position band** ("11–20"), not a fake-precise "#7".
- [ ] **Difficulty input.** Prediction needs to know a query's competition. Cheapest source is your own GSC data for queries you already rank on; beyond that it's a paid keyword API (DataForSEO / Ahrefs / Semrush) or manual SERP inspection. **Self-contained — ranks only against your own history — is the honest v1.** Costs nothing, still a real game. Market-aware is the upgrade.
- [ ] **Grade it.** Cron pulls GSC average-position per post at +7/+30/+90 days, diffs against the prediction. That delta *is* the score. This is what makes it a game and not a dashboard.
- [ ] **Feed back.** After ~20 graded predictions, re-fit the weights against what actually correlated. A spreadsheet-grade linear fit beats hand-tuned guesses.

### Phase 3 — The game layer
- [ ] **Where it lives:** private `/dashboard` behind auth, a Sanity Studio custom tool, or a local CLI over the exported JSON. **Studio tool is the best fit** — you're already there when writing, and the score belongs next to the draft, not in a tab you'll never open.
- [ ] **Pre-publish score** — run the simulator on the draft, show it before Publish with the specific misses listed ("no internal links out", "meta description missing"). Actionable beats a bare number.
- [ ] **Leaderboard** — published posts ranked by GSC clicks + GA4 engagement time. Shows which writing actually worked.
- [ ] **Streaks / quests** — publish cadence, "every post has a meta description", "no orphan posts (every post has ≥1 inbound internal link)". These map to real SEO wins — the game should only reward things that genuinely help.
- [ ] **Prediction accuracy** — your hit rate over time. The score *you're* actually playing for.

**Honest caveat:** a personal site with a handful of posts will have sparse, noisy GSC data — most queries land in the sub-10-impressions bucket where average position barely means anything. The instrumentation is worth having regardless, but the simulator won't be predictive until there's real traffic. Early on it's a checklist that happens to have a score attached.

**Refs:** [Next.js third-party libraries](https://nextjs.org/docs/app/guides/third-party-libraries) (also local: `node_modules/next/dist/docs/01-app/02-guides/third-party-libraries.md`) · [GA4 Measurement ID](https://support.google.com/analytics/answer/12270356?hl=en) · [GA4 for Next.js 16](https://medium.com/@aashari/google-analytics-ga4-implementation-guide-for-next-js-16-a7bbf267dbaa)

---

## Reference

**Stack:** Next 16.2.9 + React 19, Tailwind **v4** (tokens in `src/app/globals.css` `@theme`, there is no `tailwind.config.ts`), Sanity **v6** (`document.actions` + `newDocumentOptions`, not `__experimental_actions`).

**Pages:** `/`, `/blog/[slug]`, `/about`, `/resume`, `/now`, `/studio` — all live in prod.
**SEO:** `/sitemap.xml`, `/robots.txt`, `/feed.xml`, JSON-LD on posts, security headers, `default-og.png` — all verified 200 in prod.

**Metadata priority chain:** Sanity `seo.metaTitle`/`metaDescription` → `post.title`/`post.excerpt` → root layout default.

**Sitemap priorities:** `/` 1.0 · `/blog/[slug]` 0.8 · `/about`,`/resume` 0.7 · `/now` 0.5

**Single source of truth:** identity → `src/lib/site.ts` · colors → `src/app/globals.css` `@theme` block.

**Caching:** `revalidate` is `0` in dev, `3600` in prod, so published content shows immediately while editing.

> The stack handles the infrastructure. The rest is writing — publish consistently, be specific, link posts to each other over time.
