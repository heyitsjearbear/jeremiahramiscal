# TODO — jeremiahramiscal.com

**Status:** Specs 1–4 are **code-complete and building green**. What's left is content, deployment, external/manual config — plus one new feature not in the original specs: a **Projects section** (see below).

---

## What's actually built (and how it differs from the original spec)

The original spec assumed Next 14 + Tailwind v3 + plain Sanity. The scaffold was newer, so some mechanics changed (behavior matches the spec's intent):

| Area | Spec said | What we did | Why |
|---|---|---|---|
| Framework | Next 14 | **Next 16.2.9 + React 19** | That's what `create-next-app` installed |
| Tailwind | tokens in `tailwind.config.ts` | tokens in `src/app/globals.css` `@theme` | Tailwind **v4** has no JS config; `@theme` is the v4 idiom |
| Fonts | `next/font/google` | same (`Space_Grotesk` + `Newsreader`) | — |
| Resume singleton | `__experimental_actions` | `document.actions` + `newDocumentOptions` in `sanity.config.ts` | `__experimental_actions` was **removed in Sanity v6** |
| Image helper | default export | `createImageUrlBuilder` named export | default export deprecated |
| Site identity | "Inkwell" / "Your Name" / `yoursite.com` | **"Jeremiah Ramiscal"** / `jeremiahramiscal.com`, all in one constant `src/lib/site.ts` | real values; one-line change later |
| **Colors** | dark editorial (`#0f0f13` warm grays, `#4a9eff`) | **Sweetie 16 palette** from your VS Code theme (`#080810` cool blue-grays, accent `#41a6f6`), two-tone sidebar `#050508` | you asked to match your editor theme |
| Dev caching | `revalidate: 3600` everywhere | `0` in dev, `3600` in prod | so newly-published content shows immediately while editing |

**Pages:** `/`, `/blog/[slug]`, `/about`, `/resume`, `/now`, `/studio` — all live.
**SEO:** `/sitemap.xml`, `/robots.txt`, `/feed.xml`, JSON-LD on posts, security headers, `default-og.png` placeholder — all verified.

---

## ⬜ Remaining — Code (small, ask Claude anytime)

- [ ] **Real social links** — `src/components/SidebarNav.tsx` still has 7 placeholder URLs (email/x/youtube/tiktok/instagram/linkedin). `rss` already points to `/feed.xml`. Give handles and these get swapped.
- [ ] **`/public/llms.txt`** — plain-text site summary for AI crawlers (template in the spec's Phase 5).
- [ ] **(Optional) Google Search Console meta** — add the verification tag to root metadata in `src/app/layout.tsx` once you have the property string (or verify via DNS instead).

---

## ⬜ Planned — Projects section (+ playable C++/WASM demos)

**Status:** not built. Verified 2026-08-05 — no `projects` schema (`sanity/schemaTypes/` has only `post`, `resume`, `nowEntry`), no `/projects` route, no nav item in `src/components/SidebarNav.tsx`.

**Why:** a C++ CLI tool is in progress in a separate repo (out of scope here). When it's done it should live on the site as a *runnable* demo — compiled to WebAssembly and driven from an in-browser terminal — not just a screenshot and a GitHub link.

### Phase A — the section itself (can be done now, doesn't wait on the C++ project)
- [ ] **`projects` schema** — `sanity/schemaTypes/project.ts`, registered in `schemaTypes/index.ts`. Fields: `title`, `slug`, `summary`, `body` (Portable Text, reuse `PortableBody`), `tech[]` (string tags), `repoUrl`, `liveUrl`, `coverImage`, `status` (wip / shipped / archived), `featured` (bool), `startedAt` / `shippedAt`, `seo` (same object `post` uses), plus `demo` (see Phase B).
- [ ] **Routes** — `src/app/(site)/projects/page.tsx` (index) and `projects/[slug]/page.tsx` (detail). Mirror the blog's patterns: `generateStaticParams`, `generateMetadata` off `seo` → `summary` → root default, and the same dev/prod `revalidate` split (`0` / `3600`).
- [ ] **Queries** — add to `sanity/lib/queries.ts`; a `PostCard`-style `ProjectCard`.
- [ ] **Nav** — add `{ label: "Projects", href: "/projects" }` to `NAV` in `SidebarNav.tsx` (after Writing).
- [ ] **Studio structure** — add a Projects list item in `sanity.config.ts`, ordered by `featured` then `shippedAt desc`.
- [ ] **SEO** — `src/app/sitemap.ts`: `/projects` at 0.7, `/projects/[slug]` at 0.8. Consider `SoftwareSourceCode` JSON-LD on detail pages.

### Phase B — hosting the C++ CLI as a WASM demo
Build (in the C++ repo, not here):
- [ ] Install the **Emscripten SDK**; swap `g++`/`clang++` for `emcc`.
- [ ] `emcc main.cpp -o tool.js -s NO_EXIT_RUNTIME=1 -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap"]'` → emits `tool.js` (glue) + `tool.wasm`. Consider **twr-wasm**, which wires up stdin/stdout/stderr for shell-style C++ instead of hand-rolling it.
- [ ] Emit build artifacts into this repo under `public/demos/<slug>/` (`tool.js`, `tool.wasm`). Keep it a copy step / git submodule — don't vendor the C++ source here.

Front end (in this repo):
- [ ] Client component `src/components/WasmTerminal.tsx` — **xterm.js** in the browser, `"use client"`, mounted via `next/dynamic` with `ssr: false` (xterm touches `window`).
- [ ] Load `tool.js` at runtime (script tag or dynamic import), instantiate the module, pipe xterm keystrokes → C++ stdin and stdout/stderr → xterm. Set `locateFile` so the glue finds `tool.wasm` under `public/demos/<slug>/`.
- [ ] Wire it to Sanity: a `demo` object on the project doc (`kind: 'wasm-terminal'`, `basePath`, `entryScript`) so the detail page renders the terminal only when a demo exists.
- [ ] Lazy-load — don't ship the `.wasm` on page load; instantiate behind a "run it" button.

Deploy / config:
- [ ] Vercel serves `.wasm` as `application/wasm` already — **verify** in prod (`curl -I`) rather than assume. If it's wrong, add a header rule in `next.config.ts`.
- [ ] If the build ever uses pthreads/SharedArrayBuffer, it needs `Cross-Origin-Opener-Policy: same-origin` + `Cross-Origin-Embedder-Policy: require-corp` — those are cross-origin-isolation headers and **will interact with the existing security headers**, so scope them to the demo routes only.
- [ ] Check the `.wasm` size against the site's current weight; add a caching header (`immutable`, hashed filename) if it's large.
- [ ] Graceful fallback: no-WASM browser → show usage docs + the repo link instead of a dead terminal.

---

## ⬜ Remaining — Content (you, in `/studio` + code)

- [ ] **Fill the Resume singleton** — currently empty in Sanity, so `/resume` renders no sections. Open `/studio` → Resume → add sections/items → Publish.
- [ ] **Write 2–3 real posts** — only one test post exists.
- [ ] **Fix the test post** — `my-first-blog` has excerpt literally `"excerpt"`; it shows in RSS + JSON-LD descriptions. Replace, or delete the post.
- [ ] **Fill `seo.metaDescription`** on important posts — this is what shows in Google results.
- [ ] **`/about` content** — edit `src/app/about/page.tsx` (real bio; currently placeholder).
- [ ] **`/now` content** — now Sanity-driven. `/studio` → **Now entries** → publish a new entry each time (don't edit the old one — past entries are the trail that renders under `// previously`).

---

## ⬜ Remaining — Deploy & external config

- [ ] **🔴 Rotate `SANITY_API_READ_TOKEN`** — it was shown in chat repeatedly; treat as leaked. `sanity.io/manage → API → Tokens`, then update `.env.local` **and** Vercel.
- [ ] **Push to GitHub + import to Vercel** (Phase 0 step 6). Add all 3 env vars; mark the token **sensitive**.
- [ ] **Point `jeremiahramiscal.com` at Vercel** — domain exists but isn't linked yet. (Code already uses it as `metadataBase`; no change needed when you link it.)
- [ ] **Sanity CORS origins** (`sanity.io/manage → API → CORS Origins`, *Allow credentials* on):
  - `http://localhost:3000` — added via Studio's "Add development host" ✅ (re-add here if it ever errors)
  - `https://jeremiahramiscal.com` — **pending** (and your `*.vercel.app` URL if you'll use Studio there)
- [ ] **Register Studio on prod** — visiting `jeremiahramiscal.com/studio` will show the connect screen; click **Register this studio**.
- [ ] **(Optional) Google Search Console** — add property, verify, submit `https://jeremiahramiscal.com/sitemap.xml`, check Coverage in 3–5 days.

---

## ⬜ Before launch — replace placeholders

- [ ] `/public/default-og.png` → real 1200×630 image (current one is a near-black placeholder with an accent bar; `// TODO` marked in `src/app/blog/[slug]/page.tsx`).
- [ ] `/public/resume.pdf` → export your resume; the "Download PDF ↓" link already points there.
- [ ] Site description copy in `src/lib/site.ts` (`SITE.description`) — confirm it's the real one-liner you want.

---

## Reference

**Metadata priority chain (per page):**
1. Sanity `seo.metaTitle` / `seo.metaDescription` (manual, highest)
2. `post.title` / `post.excerpt` (auto-fallback)
3. Root layout default (last resort)

**Sitemap priorities:** `/` → 1.0 · `/blog/[slug]` → 0.8 · `/about`,`/resume` → 0.7 · `/now` → 0.5

**Single source of truth for identity:** `src/lib/site.ts` (name, author, tagline, description, url).
**Single source of truth for colors:** `src/app/globals.css` `@theme` block.

> The stack handles the infrastructure. The rest is writing — publish consistently, be specific, link posts to each other over time. hi
