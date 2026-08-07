# 🗂️ ProjectQuest

> **A hands-on Next.js + Sanity build**: add a `/projects` section to `jeremiahramiscal.com` and end with a real C++ program compiled to WebAssembly, running in a terminal on your own site. Each module adds one working piece, ties it to a concept the existing codebase already uses, and gives you test cases to prove it works before moving on.

---

## 📖 About This Guide

This is a **course, not a spec**. Nothing here is code you paste — it's the shape of the code, the file it goes in, the convention it must match, and how to know it's right. You write it.

### 🎯 Motivation

The site is live and the infrastructure is done. What's missing is the part that shows work rather than describes it. A Projects section is the obvious gap — but a Projects section that's just cards linking to GitHub is a bookmark list. The interesting version lets someone **run** the thing in the browser, which means Emscripten, WASM, and wiring C++ stdio to a terminal emulator.

That last part is the actual learning. Everything before it is repetition of patterns already in the repo — which is the point: you'll internalize the blog pipeline by rebuilding it for a second content type, and *then* do the new thing.

### 🎓 Learning Goals

| Goal | Description |
|------|-------------|
| **Sanity schemas** | Write a `document` type from scratch with `defineType`/`defineField`, validation, previews, and a nested object field |
| **GROQ** | Project only the fields a page needs, filter and order, and understand why over-fetching costs you |
| **App Router data flow** | Server Components, `generateStaticParams`, `generateMetadata`, `async params`, ISR via `revalidate` |
| **Client boundaries** | Where `"use client"` actually has to go, and why `ssr: false` is illegal in a Server Component |
| **Emscripten / WASM** | Compile C++ to `.wasm`, control the generated glue, load it at runtime instead of through the bundler |
| **Browser I/O plumbing** | Pipe a C++ program's `stdin`/`stdout` into a terminal emulator without hanging the main thread |

---

## 📚 Table of Contents

- [How to Use This Guide](#-how-to-use-this-guide)
- [Where This Fits in the Codebase](#-where-this-fits-in-the-codebase)
- [Prerequisites](#️-prerequisites)
- [Phase A — The Section](#-phase-a--the-section)
  - [Module 1: The `project` Schema](#-module-1--the-project-schema)
  - [Module 2: Queries](#-module-2--queries)
  - [Module 3: The Routes](#-module-3--the-routes)
  - [Module 4: Card + Navigation](#-module-4--card--navigation)
  - [Module 5: SEO Wiring](#-module-5--seo-wiring)
- [Phase B — The Playable Demo](#-phase-b--the-playable-demo)
  - [Module 6: Compile AlgoQuest to WASM](#-module-6--compile-algoquest-to-wasm)
  - [Module 7: The Terminal Component](#-module-7--the-terminal-component)
  - [Module 8: Wire the Demo to the Document](#-module-8--wire-the-demo-to-the-document)
  - [Module 9: Ship It Safely](#-module-9--ship-it-safely)
- [Progress Tracking](#-progress-tracking)

---

## 📌 How to Use This Guide

- **Read** the *Lesson* in each module before writing the assignment. It explains the concept the module depends on, using the version already in this repo as the reference.
- **Implement** the assignment. Signatures and field names are given so later modules line up; everything inside the function is yours.
- **Test** with the *Test cases* section before moving on. Most are "run it and look" — do them anyway. Phase B is unforgiving about skipped verification.
- **Follow the existing conventions.** They're listed below. A module that works but breaks a convention is a module to redo.

Phase A never touches C++ and can be finished in an evening or two. Phase B depends on AlgoQuest reaching a runnable state — Modules 1–5 don't wait on it.

---

## 🧭 Where This Fits in the Codebase

Every file you'll create has a sibling that already exists. Read the sibling first.

| You will write | Model it on | Notes |
|---|---|---|
| `sanity/schemaTypes/project.ts` | `sanity/schemaTypes/post.ts` | Same `seo` object, same slug options |
| register in `sanity/schemaTypes/index.ts` | the `post`/`resume`/`nowEntry` lines | Two edits: the array and the re-export |
| Studio list in `sanity.config.ts` | the "Now entries" `S.listItem()` | `defaultOrdering`, then exclude from the fallback list |
| queries in `sanity/lib/queries.ts` | `allPostsQuery` / `postQuery` / `allPostSlugsQuery` | Reuse the module-level `REVALIDATE` constant |
| `src/app/(site)/projects/page.tsx` | `src/app/(site)/page.tsx` | The home page *is* the blog index |
| `src/app/(site)/projects/[slug]/page.tsx` | `src/app/(site)/blog/[slug]/page.tsx` | The densest reference file in the repo |
| `src/components/ProjectCard.tsx` | `src/components/PostCard.tsx` | Tokens only — no raw hex |
| nav entry in `src/components/SidebarNav.tsx` | `NAV_ITEMS` | Also check `isActive` |
| `src/app/sitemap.ts` additions | the existing `staticRoutes`/`postRoutes` split | |
| `src/components/WasmTerminal.tsx` | *nothing — this one is new* | Module 7 |

**Conventions that are not negotiable:**

1. **Tailwind v4.** Tokens live in the `@theme` block of `src/app/globals.css`. There is no `tailwind.config.ts`. Use `text-heading`, `text-syntax-type`, `gap-post-gap` — never `text-[#f7768e]`.
2. **Sanity v6.** Singletons use `document.actions` + `schema.templates`, not `__experimental_actions`. Projects aren't a singleton, so you don't need either — but don't copy patterns from older tutorials into this config.
3. **One `REVALIDATE`.** `queries.ts` already computes `0` in dev / `3600` in prod. Every new fetch passes it. Don't invent a second caching story.
4. **Identity comes from `SITE`.** `src/lib/site.ts`. Absolute URLs are `${SITE.url}/...`, never a hardcoded domain.
5. **`params` is a Promise.** App Router in Next 16: `const { slug } = await params`. The blog route shows it.
6. **This is not the Next.js in your training data.** Before using an API you're unsure about, read `node_modules/next/dist/docs/`. It ships with the repo.

---

## 🛠️ Prerequisites

- The site runs locally (`npm run dev`) and `/studio` loads
- You've read `src/app/(site)/blog/[slug]/page.tsx` top to bottom at least once
- **Phase B only:** a C++ program with a text-in/text-out loop (AlgoQuest qualifies), and the [Emscripten SDK](https://emscripten.org/docs/getting_started/downloads.html) installed

---

## 📦 Phase A — The Section

## 🧩 Module 1 — The `project` Schema

### 🎥 Recommended Reading

- **Sanity — [Schema types](https://www.sanity.io/docs/schema-types)** — the field-type catalogue. Skim `string`, `slug`, `text`, `array`, `image`, `object`, `datetime`.
- **`sanity/schemaTypes/post.ts`** — the local reference implementation. Note how `seo` is an inline `object` with `collapsible`, and how `featuredImage` nests an `alt` field inside the image.

### 🧠 Assignment: Define and register the `project` document type

Create `sanity/schemaTypes/project.ts` exporting `const project = defineType({...})` with `name: "project"`, `type: "document"`.

1. **Core fields**
   - `title` — `string`, required.
   - `slug` — `slug`, `options: { source: "title", maxLength: 96 }`, required.
   - `summary` — `text`, 3 rows, `rule.max(200)`. This is the card blurb *and* the meta-description fallback, exactly like `post.excerpt`.
   - `body` — `array` of `[{ type: "block" }]`. Identical to `post.body`, which means `PortableBody` renders it for free.
2. **Project-specific fields**
   - `tech` — `array` of `[{ type: "string" }]` with `options: { layout: "tags" }`.
   - `repoUrl`, `liveUrl` — `url`. Validate the scheme: `rule.uri({ scheme: ["http", "https"] })`.
   - `coverImage` — `image`, `options: { hotspot: true }`, with a nested `alt` string field.
   - `status` — `string` with a radio `list` of `wip` / `shipped` / `archived`. Give it `initialValue: "wip"`.
   - `featured` — `boolean`, `initialValue: false`.
   - `startedAt`, `shippedAt` — `date` (not `datetime`; nobody needs the hour a project shipped).
3. **`seo` object** — copy the shape from `post.ts` verbatim: `metaTitle` (string), `metaDescription` (text, `rule.max(160)`), `ogImage` (image). Same shape means Module 3 can reuse the blog's metadata chain without special-casing.
4. **`demo` object** — stub it now, use it in Module 8. Fields: `kind` (string, list with one option `wasm-terminal`), `basePath` (string, e.g. `/demos/algoquest`), `entryScript` (string, e.g. `tool.js`). Collapsed by default.
5. **Preview** — `select: { title: "title", subtitle: "status", media: "coverImage" }`.
6. **Register it** — in `sanity/schemaTypes/index.ts`, import it, add it to the `schemaTypes` array, and add it to the named re-export. Both, not one.
7. **Studio list** — in `sanity.config.ts`, add an `S.listItem()` for projects using `S.documentTypeList("project")` with `defaultOrdering: [{ field: "featured", direction: "desc" }, { field: "shippedAt", direction: "desc" }]`. Then add `"project"` to the `.filter()` exclusion list at the bottom, or it appears twice.

### Test cases and instructions

- **It appears**: restart dev, open `/studio`. "Projects" shows in the sidebar, exactly once. Seeing it twice means you skipped 7's filter step.
- **Validation fires**: create a project, leave `title` empty, try to publish. Publish is blocked. Type a 250-character summary — the field goes red at 200.
- **Slug generates**: click *Generate* next to slug with a title set. It slugifies. Type a title with punctuation and confirm the slug is clean.
- **URL validation**: put `not-a-url` in `repoUrl`. It complains. `https://github.com/...` passes.
- **Ordering**: create three projects — one `featured: true` with an old `shippedAt`, two unfeatured with recent dates. The featured one sorts first.
- **Publish two real projects** before Module 2, one of them featured. Empty lists make the next three modules impossible to test.

### 🧩 Lesson: Schemas, documents, and the `object` type

A Sanity **schema type** is a JS object describing a shape; `defineType`/`defineField` are typed identity functions — they add no runtime behaviour, they exist so TypeScript can check field names and autocomplete `options`. Omitting them still works, and still costs you every typo.

`type: "document"` is what makes something creatable and queryable at the top level — it gets a `_id`, `_type`, `_createdAt`, `_updatedAt`, and appears in `*[_type == "project"]`. Everything else (`object`, `image`, `string`) is a **value type**: it exists only nested inside a document and has no independent identity. That's why `seo` is an `object` and not its own document — there is no such thing as "an SEO" standing alone.

Two field-type choices worth understanding rather than copying:

**`slug` vs `string`.** A `slug` field stores `{ current: "my-project", _type: "slug" }` — an object, not a string. This is why the whole codebase writes `post.slug.current` and why `allPostSlugsQuery` does `"slug": slug.current` to flatten it. Match this or every downstream file gets an extra `.current` you'll forget somewhere.

**`array of block` is Portable Text.** Rich text in Sanity is not HTML and not Markdown — it's a JSON array of block objects with `children` spans and `marks`. That's a feature: it renders to React, plain text, or anything else. `PortableBody` holds the React mapping, and because `project.body` uses the identical `block` type, that component works on projects with zero changes. Keeping content shapes uniform is what buys reuse.

Field-level `validation` runs in the Studio only. It is an editor guardrail, not a data guarantee — a document created through the API bypasses it entirely. Never let a page crash because a "required" field was empty.

### 📚 Additional Resources

- [Sanity — Schema types overview](https://www.sanity.io/docs/schema-types)
- [Sanity — Validation](https://www.sanity.io/docs/validation)
- [Portable Text spec](https://github.com/portabletext/portabletext)

---

## 🧩 Module 2 — Queries

### 🎥 Recommended Reading

- **Sanity — [GROQ cheat sheet](https://www.sanity.io/docs/query-cheat-sheet)** — the only GROQ doc worth reading in one sitting.
- **`sanity/lib/queries.ts`** — note that every export is a thin `serverClient.fetch(query, params, { next: { revalidate: REVALIDATE } })`. Match it.

### 🧠 Assignment: Add three queries and three fetchers

All in `sanity/lib/queries.ts`. Don't create a new file — one query module is the convention.

1. **`allProjectsQuery`** — `*[_type == "project"]` ordered `featured desc`, then `shippedAt desc`. Project only what a card needs: `title`, `slug`, `summary`, `tech`, `status`, `featured`, `shippedAt`, `coverImage`.
2. **`projectQuery`** — single doc by `$slug`, taking `[0]`. Add the detail-only fields: `body`, `repoUrl`, `liveUrl`, `startedAt`, `seo`, `demo`.
3. **`allProjectSlugsQuery`** — `*[_type == "project" && defined(slug.current)]{ "slug": slug.current }`. Flattened, exactly like the post version, because `generateStaticParams` wants bare strings.
4. **Fetchers** — `getAllProjects()`, `getProject(slug: string)`, `getAllProjectSlugs(): Promise<{ slug: string }[]>`. Same body shape as their post counterparts.

Sorting note: `order(featured desc, shippedAt desc)` puts `null` values somewhere you may not expect. Decide deliberately whether a `wip` project with no `shippedAt` belongs at the top or bottom, and if the default is wrong, add a coalesce: `order(featured desc, coalesce(shippedAt, startedAt) desc)`.

### Test cases and instructions

- **Vision first.** `/studio` → Vision tool → paste each query and run it before writing a single line of TypeScript. Vision is the debugger; use it instead of `console.log` in a server component.
- **Projection discipline**: `allProjectsQuery` must not return `body`. Run it in Vision and confirm. A list query dragging full Portable Text for ten projects is the classic Sanity performance mistake.
- **Missing slug**: run `projectQuery` with `$slug: "does-not-exist"`. It returns `null`, not an error, not `[]`. Module 3 depends on that being `null`.
- **Ordering**: confirm the featured project is first, and that a `wip` project with no `shippedAt` lands where you decided it should.

### 🧩 Lesson: GROQ projections, and why `REVALIDATE` is one constant

A GROQ query is three parts: a **filter** in `*[...]`, optional **ordering** with `| order(...)`, and a **projection** in `{...}`. The projection is the interesting one — it runs on Sanity's servers, so a field you don't ask for never crosses the network. `postQuery` asks for `body`; `allPostsQuery` doesn't. That difference is the entire reason the home page stays fast with a hundred posts.

`"slug": slug.current` is a **renamed projection**: compute a value and give it a key. Anything on the right can be an expression — `"wordCount": length(pt::text(body))` works too, and Module 5 of the SEO guide leans on exactly that trick.

Parameters (`$slug`) are not string interpolation. They're sent separately and never parsed as query text, which is what makes user-supplied slugs safe. Never build a GROQ string with template literals containing request data.

On caching: `REVALIDATE` is computed once at module scope as `0` in development and `3600` in production, and passed to Next's fetch cache via `{ next: { revalidate } }`. Zero means "no cache" — you publish in the Studio, refresh, and see it. In production, the first request after an hour regenerates the page in the background while everyone keeps getting the cached one (ISR). The reason it's a shared constant and not a per-query number is that a page assembled from fetches with different revalidate windows shows content from different points in time, and you will lose an afternoon to that inconsistency. Read `node_modules/next/dist/docs/01-app/02-guides/incremental-static-regeneration.md` for the mechanics.

### 📚 Additional Resources

- [GROQ query cheat sheet](https://www.sanity.io/docs/query-cheat-sheet)
- [GROQ — Sorting and ordering](https://www.sanity.io/docs/sort-order)
- Local: `node_modules/next/dist/docs/01-app/02-guides/incremental-static-regeneration.md`

---

## 🧩 Module 3 — The Routes

### 🎥 Recommended Reading

- Local: `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`
- Local: `node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md`
- **`src/app/(site)/blog/[slug]/page.tsx`** — the file you're mirroring. It does metadata, JSON-LD, `notFound()`, image URLs, and the OG fallback chain in ~150 lines.

### 🧠 Assignment: Build `/projects` and `/projects/[slug]`

1. **`src/app/(site)/projects/page.tsx`** — `async function Projects()`. Fetch with `getAllProjects()`, cast to a local `ProjectListItem` type, map to `<ProjectCard>` (Module 4). Add a static `export const metadata: Metadata` with a title and description — index pages get overlooked and then rank on nothing. Match the home page's outer layout (`max-w-[720px]`, the `// Selected writing` comment line has an obvious `// Things I've built` analogue).
2. **`src/app/(site)/projects/[slug]/page.tsx`**
   - `generateStaticParams()` → `getAllProjectSlugs()` mapped to `{ slug }`.
   - `generateMetadata({ params })` → `await params`, fetch, **return `{}` if the project is null** (the blog does this — returning early keeps the 404 from throwing during metadata generation). Title chain: `seo.metaTitle → title`. Description chain: `seo.metaDescription → summary → ""`. OG image chain: `seo.ogImage → coverImage → "/default-og.png"`, sized `.width(1200).height(630)` through `urlFor`.
   - The page: `await params`, fetch, `notFound()` when null.
   - Render: back-link to `/projects`, title, a meta row (status + date, using the `text-syntax-*` tokens the blog uses), the tech list, repo/live links, cover image via `next/image`, then `<PortableBody value={project.body} />`.
3. **Types** — declare a local `type Project = {...}` in the file, as the blog route does. The repo doesn't use generated Sanity types; don't introduce a typegen step in this module.

Do **not** create `src/app/(site)/projects/layout.tsx`. The route group's layout already wraps everything.

### Test cases and instructions

- **`/projects` renders** both published projects, featured first.
- **`/projects/<slug>` renders** the body with real heading/list styling. If headings look like body text, you're not going through `PortableBody`.
- **404 path**: visit `/projects/nope`. You get Next's not-found page, and **the server doesn't throw**. A stack trace here means `generateMetadata` isn't guarding the null.
- **Metadata chain — test all three legs**: view source and check `<title>` and `og:description` with (a) `seo` filled, (b) `seo` empty but `summary` set, (c) both empty. Three different, correct results.
- **Static params**: `npm run build`. The output lists every project slug as a prerendered route. If it says `ƒ (Dynamic)`, `generateStaticParams` isn't being picked up.
- **Both breakpoints**: check mobile — the sidebar stacks below `md`.

### 🧩 Lesson: Server Components, `async params`, and the metadata chain

Every file under `src/app/(site)/` is a **Server Component** unless it starts with `"use client"`. It runs on the server, can be `async`, can hold secrets, and ships **zero** JavaScript to the browser for itself. That's why `getProject()` is called directly in the component with no `useEffect`, no loading state, no client-side fetch — the data is resolved before HTML exists. `SidebarNav` is a Client Component only because it calls `usePathname()`.

In Next 16, `params` is a **Promise** and must be awaited. This is the change most likely to bite you if you've written App Router code before: it exists so a route can start rendering its static shell before the dynamic segment is resolved. Both the page and `generateMetadata` await the same promise — and both then call `getProject()`. That looks like a duplicate fetch and isn't: Next dedupes identical fetches within one request pass, and Sanity's response is cached by the `revalidate` window anyway.

`generateStaticParams` is what turns `[slug]` from an on-demand route into a set of pages built ahead of time. Return every slug at build; anything published later is still served correctly — it just renders on first request and then caches.

The **metadata chain** is a deliberate three-tier fallback: the hand-written `seo` field wins, the content's own summary is the automatic second choice, and the root layout's `SITE.description` catches everything else. Two properties make it work — it never produces an empty `<title>`, and it never silently ships the site-wide description as if it were about this page. The `title.template` in `src/app/(site)/layout.tsx` appends `| Jeremiah Ramiscal` to every child title, so don't append it yourself.

`notFound()` throws — it doesn't return. Anything after it never runs, which is why TypeScript stops complaining about `project` being possibly null on the following lines.

### 📚 Additional Resources

- Local: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-static-params.md`
- Local: `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- [Next.js — Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)

---

## 🧩 Module 4 — Card + Navigation

### 🎥 Recommended Reading

- **Tailwind v4 — [Theme variables](https://tailwindcss.com/docs/theme)** — how `@theme` in CSS replaces `tailwind.config.ts`.
- **`src/components/PostCard.tsx`** and the `@theme` block in `src/app/globals.css`.

### 🧠 Assignment: `ProjectCard` and the nav entry

1. **`src/components/ProjectCard.tsx`** — a Server Component (no `"use client"`; it has no interactivity). Export `type ProjectCardProps` alongside the component, as `PostCard` does. Props: `slug`, `title`, `summary?`, `tech?: string[]`, `status?`, `date?`, `featured?`.
2. **Styling rules**: every colour is a token. Title uses `text-primary` with `hover:text-accent`. Meta line uses `text-syntax-number`. Tech tags use `text-syntax-type`. Status could map to different syntax tokens per value (`wip` → `text-syntax-number`, `shipped` → `text-syntax-string`, `archived` → `text-faint`) — a small `Record<string, string>` lookup, not a chain of ternaries.
3. **Nav** — add `{ label: "Projects", href: "/projects" }` to `NAV_ITEMS` in `SidebarNav.tsx`, positioned after Writing.
4. **Active state** — read `isActive`. `"/"` is special-cased to also match `/blog`; every other href matches exactly or as a `${href}/` prefix. `/projects` and `/projects/[slug]` are already handled by that generic branch. **Verify this rather than assume it** — then leave the function alone.

### Test cases and instructions

- **Nav highlight**: on `/projects` and on `/projects/some-slug`, "projects" renders in `text-syntax-keyword` with `font-medium`. On `/` it doesn't.
- **No hex anywhere**: `grep -n "#[0-9a-fA-F]\{6\}" src/components/ProjectCard.tsx` returns nothing.
- **Optional props**: render a project with no `tech`, no `summary`, no `coverImage`. No `undefined` text, no empty bullet, no layout collapse.
- **Visual consistency**: put `/` and `/projects` side by side. Vertical rhythm and type scale should look like the same site, not a second one.

### 🧩 Lesson: Tailwind v4 tokens and why the token layer matters

Tailwind v4 moved configuration into CSS. The `@theme` block in `globals.css` declares custom properties, and Tailwind generates utilities from their names: `--color-syntax-type` becomes `text-syntax-type`, `bg-syntax-type`, `border-syntax-type`. There is no `tailwind.config.ts` in this project and adding one is a regression — half your theme would live in each place.

The discipline this enforces is worth naming. `text-[#f7768e]` and `text-syntax-type` render identically today. They differ the moment you retheme: one is a single edit in `globals.css`, the other is a repo-wide find-and-replace where you miss two. The palette here (Sweetie 16, mapped from an editor theme) is also *semantic* — `syntax-string`, `syntax-keyword`, `syntax-comment` mean something. A card that colours its title with `syntax-function` and its tags with `syntax-type` isn't decorated, it's consistent with the metaphor the whole site runs on.

Arbitrary values like `text-[13px]` and `tracking-[0.05em]` **are** used throughout, deliberately — those are one-off typographic values from the design spec, not reusable semantics. The rule is: colours and spacing rhythms are tokens, one-off type metrics can be arbitrary.

`SidebarNav` is `"use client"` for exactly one reason: `usePathname()` is a hook, hooks need React state, and state needs the client. That's the smallest possible client boundary — the nav is interactive, the pages it links to are not. Keep new components server-side until something forces otherwise.

### 📚 Additional Resources

- [Tailwind v4 — Theme variables](https://tailwindcss.com/docs/theme)
- [Tailwind v4 — Upgrade guide](https://tailwindcss.com/docs/upgrade-guide) (useful for spotting v3 answers online)

---

## 🧩 Module 5 — SEO Wiring

### 🎥 Recommended Reading

- Local: `node_modules/next/dist/docs/01-app/02-guides/json-ld.md`
- **[Schema.org — SoftwareSourceCode](https://schema.org/SoftwareSourceCode)**
- **`src/app/sitemap.ts`** and the `jsonLd` block in the blog route.

### 🧠 Assignment: Sitemap entries and structured data

1. **`src/app/sitemap.ts`** — add `/projects` to `staticRoutes` (`priority: 0.7`, `changeFrequency: "monthly"`). Add a `projectRoutes` array built from `getAllProjects()`, `priority: 0.8`, `lastModified` from `shippedAt`. Spread all three arrays in the return.
2. **JSON-LD** — on the project detail page, emit a `SoftwareSourceCode` object: `name`, `description`, `codeRepository` (from `repoUrl`), `programmingLanguage` (from `tech`), `author` (reuse the `{ "@type": "Person", name: SITE.author, url: SITE.url }` shape), `url`. Same rendering mechanism as the blog: a `<script type="application/ld+json">` with `dangerouslySetInnerHTML`.
3. **Field discipline** — omit keys whose source is empty. `codeRepository: undefined` disappears cleanly in `JSON.stringify`; `codeRepository: ""` is a validation error.

### Test cases and instructions

- **Sitemap**: `curl -s localhost:3000/sitemap.xml`. Every project slug present, priorities correct, no duplicate `/projects`.
- **Rich Results Test**: run a project URL through [Google's validator](https://search.google.com/test/rich-results) after deploying. Zero errors. Warnings about optional properties are fine.
- **Empty fields**: view source on a project with no `repoUrl`. The JSON-LD has no `codeRepository` key at all — not an empty string.
- **Valid JSON**: copy the JSON-LD out of view-source into a validator. A stray quote in a title will break it; `JSON.stringify` handles that, hand-built strings don't.

### 🧩 Lesson: What structured data actually buys you

JSON-LD is a machine-readable summary of a page for consumers that can't parse your layout — search engines, and now LLM crawlers. It's a script tag whose content is never rendered, so it's the one place where "hidden text describing the page" is legitimate rather than spam. The rule that keeps it legitimate: **it must describe what's visibly on the page**. A `SoftwareSourceCode` entry for a repo you don't link is exactly the kind of thing that earns a manual penalty.

`dangerouslySetInnerHTML` looks alarming and is correct here. React escapes text children, which would turn the JSON's quotes into `&quot;` and produce invalid JSON-LD. `JSON.stringify` on an object you constructed — not on raw user input pasted into a string — is the safe pattern, and it's what the blog route already does.

On sitemap priorities: they're a *relative* hint within your own site, not a ranking lever. The existing scale is coherent — home 1.0, content 0.8, evergreen pages 0.7, `/now` 0.5. Projects at 0.8 says "as important as posts," which is the honest answer. Making everything 1.0 conveys exactly as much information as making everything 0.5.

`lastModified` is the field crawlers actually act on. Feeding it `shippedAt` means a project's entry stops changing once shipped, which is truthful. Feeding it `new Date()` on every build tells Google everything changed every deploy, and it will start ignoring you.

### 📚 Additional Resources

- [Google — Intro to structured data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- Local: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/sitemap.md`

---

## 📦 Phase B — The Playable Demo

> Phase A is a second content type. Phase B is the part nobody else's portfolio has. It also has the sharpest failure modes, so test each module before stacking the next one.

## 🧩 Module 6 — Compile AlgoQuest to WASM

### 🎥 Recommended Reading

- **[Emscripten — Getting started](https://emscripten.org/docs/getting_started/Tutorial.html)**
- **[Emscripten — Interacting with code](https://emscripten.org/docs/porting/connecting_cpp_and_javascript/Interacting-with-code.html)** — read the section on the main loop and `NO_EXIT_RUNTIME` twice.
- **[twr-wasm](https://twiddlingbits.dev/docsite/)** — a library that already solves stdin/stdout for shell-style C++. Evaluate it before hand-rolling Module 7.

### 🧠 Assignment: Produce loadable artifacts (in the AlgoQuest repo, not here)

1. **Install the SDK** — `emsdk install latest && emsdk activate latest`, then source `emsdk_env.sh`. Confirm with `emcc -v`.
2. **First compile** — swap `g++` for `emcc` in the Makefile as a separate target so native builds still work:
   ```
   emcc main.cpp -o tool.js \
     -s NO_EXIT_RUNTIME=1 \
     -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap","FS","callMain"]' \
     -s MODULARIZE=1 -s EXPORT_NAME=createTool \
     -s ALLOW_MEMORY_GROWTH=1 \
     -O2
   ```
   You get `tool.js` (the glue) and `tool.wasm` (the code).
3. **Understand each flag before keeping it.** `MODULARIZE=1` is what makes the glue export a factory function instead of polluting `window` — mandatory for a React page that may mount the terminal twice. `NO_EXIT_RUNTIME=1` keeps the runtime alive after `main()` returns. `ALLOW_MEMORY_GROWTH=1` avoids a hard OOM at the default heap size.
4. **The blocking-input problem.** A C++ REPL is `while (true) { getline(cin, line); ... }`. In a browser, blocking the thread blocks rendering — the tab freezes and nothing ever reaches the terminal. Pick one:
   - **(a) Command-at-a-time.** Refactor so one exported function processes one command string and returns output. `EXPORTED_FUNCTIONS='["_process_command"]'` with `extern "C"`. **Least clever, most likely to work — start here.**
   - **(b) Asyncify.** `-s ASYNCIFY -s ASYNCIFY_STACK_SIZE=65536`. Emscripten rewrites the binary so `getline` can suspend and resume. Keeps your C++ shape intact; costs binary size and speed.
   - **(c) twr-wasm.** The library does (b)'s work for you, with a documented stdio bridge.
5. **Ship the artifacts** — copy `tool.js` + `tool.wasm` into this repo at `public/demos/algoquest/`. A `make web` target or a small copy script. **Do not vendor the C++ source here** — this repo serves the build output, the other repo owns the code.
6. **`.gitignore` decision** — commit the artifacts (simple, and Vercel needs no toolchain) or build them in CI (clean, but now Vercel needs emsdk). For a personal site, commit them and write down why.

### Test cases and instructions

- **Native build still works.** Run the normal `make` target first. If adding the wasm target broke the native one, fix that before continuing.
- **Node smoke test**: `node tool.js`. The program runs in the terminal, no browser involved. If it fails here, the browser will not save you.
- **Size check**: `ls -lh tool.wasm`. Under ~1 MB for a CLI game. Multiple MB means you kept `-O0` or pulled in iostreams you don't need — try `-Os` and compare.
- **Freeze test** (path (a)): call your exported function twice in Node with different commands and confirm state persists between calls. State that resets means you're re-initialising the module each call.
- **Both files present**: `public/demos/algoquest/` contains `tool.js` and `tool.wasm`. The glue looks for the `.wasm` by name — a missing one is a silent 404 that surfaces as a mysterious instantiation failure.

### 🧩 Lesson: What Emscripten actually produces

`emcc` gives you two artifacts with very different jobs. The `.wasm` is your compiled C++ — a binary module of exported functions operating on a linear memory buffer. The `.js` is **glue**: it fetches and instantiates the `.wasm`, allocates that memory, and emulates the parts of a C++ runtime the browser doesn't have — a virtual filesystem (`FS`), `stdout`/`stderr` sinks, `malloc`'s heap. WASM alone cannot touch the DOM, read a file, or print. Every one of those goes through the glue.

`MODULARIZE=1` changes the glue's export from "run on load, dump globals" to "export a factory returning a Promise of a module instance." That matters here specifically: React in dev mounts components twice under Strict Mode, and a globals-based glue produces two runtimes fighting over one namespace. The factory form gives each mount its own instance, and gives you a promise to await before wiring anything up.

The blocking-input problem is the real lesson, and it's not a WASM quirk — it's the browser's single-threaded event loop. Your C++ `while (true) { getline(...) }` expects the OS to suspend the process until a keystroke arrives. There is no OS. A synchronous loop that never yields never returns control to the event loop, so no render happens, no key event is delivered, and the tab hangs forever. **Asyncify** solves it by instrumenting the binary to unwind and rewind the call stack at suspend points, so `getline` can become an `await` in disguise — genuinely impressive, and it inflates the binary and slows every call because the instrumentation is global. The command-at-a-time refactor sidesteps the whole problem by making each call finite and returning to the event loop between commands. Start there; you can always upgrade.

### 📚 Additional Resources

- [Emscripten — Asyncify](https://emscripten.org/docs/porting/asyncify.html)
- [Emscripten — Optimizing code](https://emscripten.org/docs/optimizing/Optimizing-code.html)
- [MDN — WebAssembly concepts](https://developer.mozilla.org/en-US/docs/WebAssembly/Concepts)

---

## 🧩 Module 7 — The Terminal Component

### 🎥 Recommended Reading

- **[xterm.js](https://xtermjs.org/)** — note the package is `@xterm/xterm` (the old `xterm` name is the pre-5.x line). Addons are separate packages, e.g. `@xterm/addon-fit`.
- Local: `node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md` — read the "Skipping SSR" section. It contains the constraint that shapes this entire module.

### 🧠 Assignment: `WasmTerminal.tsx`

1. **Install** — `npm install @xterm/xterm @xterm/addon-fit`.
2. **The component** — `src/components/WasmTerminal.tsx`, `"use client"` at the top. Props: `{ basePath: string; entryScript: string }`.
3. **Mounting xterm** — a `<div>` with a `useRef`, and a `useEffect` that constructs `new Terminal(...)`, `.open(ref.current)`, loads `FitAddon`, and — critically — **disposes the terminal in the effect's cleanup**. Import the CSS: `import "@xterm/xterm/css/xterm.css"`.
4. **Loading the glue at runtime, not through the bundler.** Inject a `<script src={`${basePath}/${entryScript}`}>` into `document.head` and await its `onload`, then read the factory off `window`. Do **not** `import()` the Emscripten glue — it's not a real ES module, and Turbopack (the default bundler in Next 16) will either mangle it or fail to resolve `tool.wasm`.
5. **`locateFile`** — pass `{ locateFile: (path) => `${basePath}/${path}` }` to the factory. Without it the glue resolves `tool.wasm` against the *page's* URL, so `/projects/algoquest` requests `/projects/tool.wasm` and 404s. **This is the single most common failure in this module.**
6. **Wire stdout** — pass `print` and `printErr` in the module config; each receives a line of text. Write it to xterm with `term.writeln(...)`. Note that xterm needs `\r\n`, not `\n` — `writeln` handles it, raw `write` doesn't.
7. **Wire stdin** — `term.onData((data) => ...)`. This fires per keystroke, including control characters. You maintain the current line buffer yourself: append printable characters and echo them, handle `\r` (Enter) by submitting the buffer, handle `\x7f` (Backspace) by trimming the buffer and emitting `\b \b`.
8. **Submit** — on Enter, call into WASM (`ccall`/`cwrap` for path (a), or push to the stdin queue for Asyncify), write the result, print a fresh prompt.
9. **Lifecycle** — one `useEffect` with `[]`, an `AbortController` or `cancelled` flag so a fast unmount doesn't write into a disposed terminal, and cleanup that disposes both the terminal and the module instance.

### Test cases and instructions

- **Renders empty first**: mount with no WASM wiring at all and confirm you get a black terminal that echoes keystrokes. Prove xterm works before adding WASM.
- **Strict Mode double-mount**: in dev, React mounts twice. You should see **one** terminal and **one** banner. Two means cleanup isn't disposing.
- **`locateFile` proof**: open DevTools → Network, filter `wasm`. The request must be `/demos/algoquest/tool.wasm` and return **200 with `Content-Type: application/wasm`**. A 404, or a 200 with `text/html`, both mean the path is wrong.
- **Backspace**: type `helllo`, backspace twice, type `o`. The visible line and the buffer you'd submit must agree. Getting one right and the other wrong is the classic bug here.
- **stdout ordering**: run a command printing several lines. Order preserved, no lines lost, no interleaving with the prompt.
- **Unmount**: navigate away mid-run. No console errors, no "write after dispose", no leaked interval.
- **Resize**: shrink the window. `FitAddon.fit()` on a resize listener keeps columns correct.

### 🧩 Lesson: `ssr: false` and where the client boundary has to be

Here's the constraint that dictates the architecture. `next/dynamic` with `{ ssr: false }` **is not allowed in a Server Component** — the local docs state it outright: *"`ssr: false` is not allowed with `next/dynamic` in Server Components. Please move it into a Client Component."*

Your project detail page is a Server Component. `WasmTerminal` must not be server-rendered, because xterm touches `window` and `document` at construction and would crash the prerender. So you cannot write `dynamic(() => import("@/components/WasmTerminal"), { ssr: false })` in the page.

The fix is a **two-component sandwich**:

```tsx
// src/components/DemoLoader.tsx
"use client";
import dynamic from "next/dynamic";

const WasmTerminal = dynamic(() => import("./WasmTerminal"), { ssr: false });
```

`DemoLoader` is a Client Component, so `ssr: false` is legal inside it. The Server Component page imports `DemoLoader` normally. The boundary lands exactly where it must, and nothing above it becomes client code.

The second half is why you inject a `<script>` tag instead of importing the glue. Bundlers assume they can statically analyse a module: resolve its imports, rewrite its asset paths, tree-shake it. Emscripten glue violates every assumption — it's generated code that fetches a sibling `.wasm` by a runtime-computed path and may use `eval`-adjacent constructs. Loading it via a DOM `<script>` tag takes the bundler out of the conversation entirely: the browser fetches a plain static file from `/public` at runtime, and `locateFile` tells it where the sibling lives. Fewer moving parts, and it survives a bundler upgrade.

Finally, `useEffect` cleanup is not optional here. React 18+ Strict Mode deliberately mounts, unmounts, and remounts every component in development to surface exactly this class of bug. A terminal that appears twice in dev is not a dev-only glitch — it's a real leak that will also happen in production on client-side navigation. Fix it when you see it.

### 📚 Additional Resources

- [xterm.js API](https://xtermjs.org/docs/api/terminal/classes/terminal/)
- Local: `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md`
- [React — You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) (for judging whether the effect is doing too much)

---

## 🧩 Module 8 — Wire the Demo to the Document

### 🧠 Assignment: Render the terminal only when a demo exists

1. **Use the `demo` field** from Module 1. On a project detail page, render the demo block only when `project.demo?.kind === "wasm-terminal"` and `basePath` is set.
2. **Gate behind a button.** Default state is a static panel: the project's cover or a description, and a "▶ Run it" button. Only on click do you mount `DemoLoader`. A visitor reading about the project shouldn't pay for a megabyte of `.wasm`.
3. **Loading state** — `dynamic()` takes a `loading` option. Use it; instantiation isn't instant on a cold cache.
4. **Fallback** — when there's no demo, render usage instructions and the repo link. Never a dead terminal.
5. **Error boundary** — if instantiation fails, show a message with the repo link, not a blank box. Catch around the load and set an error state.

### Test cases and instructions

- **No demo**: a project with an empty `demo` object renders the fallback and loads **no** demo-related JS. Check the Network tab.
- **Deferred load**: on a project *with* a demo, confirm no `.wasm` request on page load. It appears only after clicking Run.
- **Second visit**: navigate away and back, click Run again. Works. No duplicate terminal.
- **Forced failure**: temporarily set `basePath` to a bad path in the Studio. You get the error message and the repo link, not a white screen.
- **Lighthouse**: run it on a demo project page. Performance shouldn't drop meaningfully versus a blog post — that's what deferring buys you.

### 🧩 Lesson: Progressive enhancement as a bundle-size decision

The demo is the best thing on the page and the worst thing for it. A WASM module plus xterm plus its CSS is easily 1–2 MB. Most visitors will read the summary and leave. Shipping the payload to all of them to serve the few who click is a straightforwardly bad trade — and it's measurable, which is what makes it a real engineering decision rather than a preference.

Deferring behind a click gives you three things at once: the initial page stays as light as a blog post, the demo becomes an intentional action (which also makes it trackable — see the SEO guide's custom events), and the failure mode gets contained. If instantiation breaks, the page above it was already rendered and readable.

Storing `basePath` and `entryScript` in Sanity rather than hardcoding them is the same instinct applied to content: adding a second demo later is a new document, not a code change. And `kind` being an enum with one value today is deliberate — the day you want `kind: 'canvas'` or `kind: 'iframe'`, the component picks a renderer from the field instead of you rewriting the conditional.

### 📚 Additional Resources

- Local: `node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md`
- [web.dev — Reduce JavaScript payloads with code splitting](https://web.dev/articles/reduce-javascript-payloads-with-code-splitting)

---

## 🧩 Module 9 — Ship It Safely

### 🧠 Assignment: Verify in production, don't assume

1. **MIME type** — after deploying: `curl -I https://jeremiahramiscal.com/demos/algoquest/tool.wasm`. You need `content-type: application/wasm`. `WebAssembly.instantiateStreaming` **rejects** anything else. If it's wrong, add a `headers()` entry in `next.config.ts` scoped to `source: "/demos/:path*.wasm"`.
2. **Existing headers** — `next.config.ts` already sets `X-Content-Type-Options: nosniff` on `/(.*)`. That's the header that turns a wrong MIME type from "works anyway" into a hard failure. Know that it's there before you debug.
3. **COOP/COEP — only if you need it.** If your build uses pthreads or `SharedArrayBuffer`, the browser requires `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`. These are **destructive if applied site-wide** — they break third-party embeds and can break analytics. Scope them to `source: "/projects/:slug*"` or the demo assets only. If you took the command-at-a-time path in Module 6, you almost certainly don't need them; check before adding.
4. **Caching** — files in `/public` are served with a modest cache by default. Since the artifacts are content-stable between builds, consider a long `Cache-Control` on `/demos/:path*` — and note that then you must change the filename to ship an update.
5. **Mobile reality check** — open a demo project on a phone. xterm on a touch keyboard is genuinely awkward. Decide deliberately: a "best on desktop" note, a read-only transcript below `md`, or accept it.
6. **Update the docs** — add a line to `README.md` or `TODO.md` describing how to rebuild and copy the artifacts. Future-you will not remember the `emcc` flags.

### Test cases and instructions

- **Prod MIME**: the `curl -I` above returns `application/wasm`. Not localhost — production.
- **Real device**: load a demo on an actual phone over cellular. Time to interactive after clicking Run.
- **Safari**: test it. WASM support is fine, but Safari is the strictest about COEP and the most likely to surface a header mistake.
- **No console errors** on a demo page in production, in two browsers.
- **Headers didn't leak**: if you added COOP/COEP, confirm `curl -I https://jeremiahramiscal.com/` does **not** show them. Site-wide COEP is how you silently break embeds and analytics.
- **Full crawl**: `/`, `/projects`, a project with a demo, a project without, `/blog/<slug>`, `/resume`, `/now`, `/studio`. All 200, all rendering.

### 🧩 Lesson: Response headers are shared state

`next.config.ts`'s `headers()` is a list of rules matched by `source` pattern, and every rule that matches applies. `/(.*)` matches everything — so anything you add there lands on `/studio`, on `/feed.xml`, on your OG images. Specific rules are additive, not overriding.

That's what makes COOP/COEP dangerous. Cross-origin isolation exists so the browser can safely hand you `SharedArrayBuffer` and high-resolution timers — capabilities that were disabled everywhere after Spectre. The cost is that every cross-origin resource must explicitly opt in via CORP/CORS headers, and resources that don't get **blocked**, not warned about. Turn it on site-wide and your Sanity CDN images, embedded videos, and `gtag.js` may all silently vanish. Scope it to the routes that need it, or better, arrange not to need it.

`X-Content-Type-Options: nosniff` is the other one to understand, because it changes a failure's symptom. Without it, a browser might sniff a mislabelled `.wasm` and work anyway. With it — and the repo sets it globally — the browser trusts the declared type absolutely, so a wrong `Content-Type` produces a flat refusal. Right call for security, and the reason you verify the MIME type with `curl` rather than trusting that it worked locally.

The general lesson: production verification is not paranoia. Local dev serves `/public` through a different code path than Vercel's CDN. `curl -I` against the real domain takes ten seconds and is the difference between knowing and assuming.

### 📚 Additional Resources

- [MDN — Cross-Origin-Embedder-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Embedder-Policy)
- [web.dev — Why you need cross-origin isolation](https://web.dev/articles/why-coop-coep)
- Local: `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/headers.md`

---

## 📊 Progress Tracking

**Phase A — the section**
- [ ] Module 1: The `project` schema (+ registered, + Studio list)
- [ ] Module 2: Queries and fetchers
- [ ] Module 3: `/projects` and `/projects/[slug]`
- [ ] Module 4: `ProjectCard` + nav entry
- [ ] Module 5: Sitemap + JSON-LD

**Phase B — the demo**
- [ ] Module 6: Emscripten build, artifacts in `public/demos/<slug>/`
- [ ] Module 7: `WasmTerminal` + client-boundary sandwich
- [ ] Module 8: `demo` field wiring, deferred behind a button
- [ ] Module 9: Production verification

---

## 🎓 Learning Outcomes

| Area | Mastery |
|---|---|
| **Sanity** | Author document and object types, validation, Studio structure, and understand why Portable Text is JSON rather than markup |
| **GROQ** | Filter, order, project, and rename — and know why the list query and the detail query must differ |
| **App Router** | Server vs Client Components, `async params`, `generateStaticParams`, the metadata fallback chain, ISR |
| **Client boundaries** | Place `"use client"` at the smallest correct scope, and know why `ssr: false` forces a wrapper component |
| **WASM** | Compile C++ with Emscripten, understand the glue/binary split, and solve blocking input in a single-threaded event loop |
| **Shipping** | Verify MIME types, scope response headers, defer heavy payloads, and test on real devices |

---

## 💡 Tips for Success

- **Read the sibling file first.** Every Phase A module has one. Half the work is already written, once.
- **Vision before TypeScript.** Debug GROQ in the Studio, not in a server component.
- **Prove each layer separately in Phase B.** Terminal without WASM. WASM in Node without the browser. Then together. Debugging all three at once is how a weekend disappears.
- **`locateFile` is the answer** to roughly half of "the demo doesn't load."
- **Publish real content as you go.** Two real projects in the Studio make every module testable; an empty dataset makes them all theoretical.
- **When in doubt, read `node_modules/next/dist/docs/`.** This Next.js is not the one in your memory or in most blog posts.

---

**Now go build it. 🚀**
