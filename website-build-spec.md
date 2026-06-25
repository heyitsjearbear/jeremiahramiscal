# Website Build Spec
## Stack: Next.js · Sanity · Tailwind · Vercel

---

## Pages
- `/` — home, blog post list
- `/blog/[slug]` — single post
- `/about` — static about page
- `/resume` — resume, powered by Sanity singleton
- `/now` — static "what I'm working on right now" page

> Note: there is no /videos page. Video content lives on external platforms (YouTube, TikTok, Instagram). The sidebar links directly to those profiles.

---

## Phase 0: Manual Setup
> Do all of this yourself before running any Claude Code spec.

### 1. Decide on a site name
The Claude Design uses "Inkwell" as a placeholder. Replace it with your actual site name before running Spec 1 — it appears in the sidebar header and root metadata.

### 2. Create Next.js project
```bash
npx create-next-app@latest your-site-name --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd your-site-name
```

### 3. Install core dependencies
```bash
npm install next-sanity @sanity/image-url @sanity/client @sanity/vision groq @portabletext/react
```

### 4. Create Sanity project
- Go to sanity.io/manage
- Create new project, choose blank schema
- Note your Project ID and Dataset name (usually "production")
- Generate a read token under API → Tokens

### 5. Create `.env.local`
```
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=your_read_token
```

### 6. Connect to Vercel
- Push repo to GitHub
- Import project at vercel.com
- Add all three env variables in Vercel dashboard (mark SANITY_API_READ_TOKEN as sensitive)
- Use the .vercel.app subdomain for now, point your real domain later

### 7. Prepare Claude Design files
- Unzip the Claude Design output (Dark_Editorial_Writing_Blog__1_.zip)
- Keep the folder accessible — attach or reference it in Spec 1

---

## Spec 1: Design Implementation
> Paste this into Claude Code. Attach the unzipped Claude Design folder.

```
I have a design output from Claude Design for a personal creative writing and portfolio site.
Implement it as a Next.js 14+ App Router project with Tailwind CSS.

Pages:
- / (home — blog post list)
- /blog/[slug] (single post)
- /about (static)
- /resume
- /now (static)

There is NO /videos page. Video content is on external platforms linked from the sidebar.

---

DESIGN TOKENS
Extract all of the following into tailwind.config.ts as named custom tokens.
Do not hardcode any design values inline — everything goes through Tailwind tokens.

Colors:
- bg: #0f0f13
- text-primary: #e8e8ea
- text-heading: #f0f0f2
- text-body: #cfcfd6
- text-muted: #9a9aa3
- text-subtle: #6b6b75
- text-faint: #5a5a64
- text-faintest: #56565f
- accent: #4a9eff

Spacing:
- sidebar-width: 200px
- sidebar-padding: 46px 30px 38px
- main-padding: 92px 72px 150px 120px
- post-gap: 58px

---

FONTS
Load both fonts via next/font/google — NOT via Google Fonts CSS @import.

```ts
import { Space_Grotesk, Newsreader } from 'next/font/google'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-sans'
})

const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-reading'
})
```

Apply spaceGrotesk as the default body font via the html tag.
Apply newsreader as a CSS variable (--font-reading) used on post body text and excerpts.

---

LAYOUT — app/layout.tsx

Fixed left sidebar (200px wide):
- Top: site name (19px, bold, letter-spacing -0.02em) + tagline below it (12px, muted)
- Middle: nav links (Writing, Resume, About, Now) — vertical list, 13px gap
  - Active link: color #e8e8ea, weight 500
  - Inactive link: color #6b6b75, weight 400
  - Hover: translateX(3px) transition
- Bottom: social links in a flex-wrap row (not a column)
  - Links: email, x, youtube, tiktok, instagram, linkedin, rss
  - Layout: display flex, flex-wrap wrap, gap 7px 14px
  - Style: 12px, color #5a5a64, hover accent color

Main content area:
- margin-left: 200px
- padding: 92px 72px 150px 120px

Mobile (below md breakpoint):
- Sidebar collapses to a top nav
- Main content takes full width with reduced padding

---

PAGES — build all as React Server Components with static placeholder content.
No data fetching yet. Replace real content in Spec 3.

app/page.tsx — blog index
- Small uppercase label: "Selected writing" (12px, letter-spacing 0.14em, color #5a5a64, margin-bottom 48px)
- List of placeholder posts, each article has:
  - Date (13px, uppercase, letter-spacing 0.05em, color #6b6b75)
  - Title as large link (clamp 28px–44px, bold, letter-spacing -0.02em, color #e8e8ea, hover: accent)
  - Excerpt paragraph (reading font, 18px, line-height 1.5, color #9a9aa3, max-width 560px)
  - Tags line (13px, color #56565f)
  - 58px gap between posts
  - max-width 720px on the container

app/blog/[slug]/page.tsx — single post
- Back link "← Writing" (13px, accent color)
- Title (clamp 34px–58px, bold, letter-spacing -0.025em, color #f0f0f2)
- Meta line below title: "date · category" (13px, uppercase, letter-spacing 0.05em, color #6b6b75)
- Body paragraphs (reading font, 19px, line-height 1.78, color #cfcfd6, 1.5em gap between)
- max-width 65ch

app/about/page.tsx — static, no CMS
- Title "About" (clamp 32px–50px, bold)
- Body paragraphs same style as single post
- max-width 65ch
- Hardcode placeholder paragraph content — this page is static and updated manually

app/resume/page.tsx — placeholder structure only
- Title "Resume" (clamp 32px–50px, bold)
- "Download PDF ↓" link (13px, accent color) pointing to /resume.pdf
- List of placeholder sections, each with:
  - Section label (12px, uppercase, letter-spacing 0.14em, color #5a5a64, margin-bottom 22px)
  - Items in a two-column grid: left col 96px (year, muted), right col (title 16px medium + detail reading font 15px muted)
  - 20px gap between items, 50px margin above each section
- max-width 640px

app/now/page.tsx — static, no CMS
- Title "Now" (clamp 32px–50px, bold)
- "Updated [Month Year]" subtitle (13px, uppercase, muted)
- Body paragraphs same style as about page
- max-width 65ch
- Hardcode placeholder paragraph content — updated manually in code

---

COMPONENTS
Build a components/ directory with these reusable pieces:
- PostCard — renders a single post preview (date, title, excerpt, tags)
- SidebarNav — the fixed left sidebar including nav and social links
- ResumeSection — renders one resume section (label + items grid)
- ResumeItem — renders one year/title/detail row

---

Deliver full file structure including tailwind.config.ts, all app/ routes, and all components/.
No 'use client' directives unless strictly required for interactivity.
```

---

## Spec 2: Sanity Schema
> Paste this into Claude Code after Spec 1 is complete.

```
Set up Sanity Studio embedded in this Next.js project and create the content schema.

The following env variables already exist in .env.local:
- NEXT_PUBLIC_SANITY_PROJECT_ID
- NEXT_PUBLIC_SANITY_DATASET
- SANITY_API_READ_TOKEN

Create:

1. sanity.config.ts at the project root

2. app/studio/[[...tool]]/page.tsx
   - Embedded Sanity Studio at /studio
   - Add 'use client' and force-dynamic export

3. sanity/schemaTypes/post.ts with fields:
   - title (string, required)
   - slug (slug, source: title, required)
   - excerpt (text, max 200 chars — used as meta description fallback)
   - publishedAt (datetime)
   - category (string, list options: essay · fiction · thought · creative)
   - body (array of block content — portable text)
   - featuredImage (image with alt text field)
   - seo (object with fields:
       metaTitle (string)
       metaDescription (text, max 160 chars)
       ogImage (image)
     )

4. sanity/schemaTypes/resume.ts — singleton document
   Fields:
   - sections (array of objects, each with:
       sectionTitle (string, required — e.g. "Experience", "Education", "Awards")
       items (array of objects, each with:
           year (string — e.g. "2024" or "2022 — now")
           title (string — e.g. "Technical PM")
           detail (string — e.g. "MoFlo · AI marketing SaaS")
       )
     )

   This is a flat generic structure. Every section renders identically regardless
   of type — year on the left (96px), title + detail on the right.
   You add whatever sections you need in Studio and they all use the same three fields.

   Make it a singleton:
   - Set __experimental_actions to exclude 'create' and 'delete'
   - Add desk structure config in sanity.config.ts linking directly to the single resume document

5. sanity/schemaTypes/index.ts exporting both types: post, resume

6. sanity/lib/client.ts
   - Public Sanity client: projectId, dataset, apiVersion '2024-01-01', useCdn true
   - serverClient using SANITY_API_READ_TOKEN for server-side fetches with revalidation

7. sanity/lib/queries.ts — GROQ query functions:
   - getAllPosts() — returns title, slug, excerpt, publishedAt, category. Sorted newest first.
   - getPost(slug: string) — returns full post including body and seo object
   - getAllPostSlugs() — returns slug.current only, used for generateStaticParams
   - getResume() — returns the singleton resume document with sections[] and nested items[]

8. sanity/lib/image.ts
   - urlFor(source) helper using @sanity/image-url
```

---

## Spec 3: Next.js + Sanity Integration
> Paste this into Claude Code after Spec 2 is complete.

```
Connect the existing Next.js frontend to Sanity. Replace all static placeholder content
with live Sanity data. Keep identical visual structure from Spec 1 — only content changes.

1. app/page.tsx
   - Fetch all posts using getAllPosts()
   - Map over posts and render using PostCard component
   - Format publishedAt as readable date string (e.g. "June 12, 2026") for display
   - Pass category as the tags line

2. app/blog/[slug]/page.tsx
   - Add generateStaticParams using getAllPostSlugs()
   - Fetch post using getPost(slug)
   - Render body using @portabletext/react with component map:
     (p, h2, h3, ul, ol, li, strong, em, a)
   - Meta line: format publishedAt as readable date + " · " + category
     e.g. "June 12, 2026 · fiction"
   - Add generateMetadata function:
       title: post.seo?.metaTitle || post.title
       description: post.seo?.metaDescription || post.excerpt
       openGraph:
         title, description, type 'article', publishedTime: post.publishedAt,
         url: https://yoursite.com/blog/[slug],
         images: [post.seo?.ogImage url or '/default-og.png']
       twitter: card 'summary_large_image', title, description

3. app/layout.tsx
   - Add root metadata export:
       title: { template: '%s | Your Name', default: 'Your Name' }
       description: your default site description
       metadataBase: new URL('https://yoursite.com')

4. app/resume/page.tsx
   - Fetch resume using getResume()
   - Map over sections[]. For each section render:
       Section label (sectionTitle, uppercase, letter-spaced, muted)
       Map over items[]: two-column grid, year left (96px muted), title + detail right
       Title: 16px medium weight, color #d8d8dc
       Detail: reading font (--font-reading), 15px, color #8a8a94
   - If sections array is empty or resume has no data, render nothing
   - Static "Download PDF ↓" link pointing to /resume.pdf (file dropped in Phase 6)

5. app/about/page.tsx and app/now/page.tsx — keep as static.
   These pages are hardcoded and updated manually. No Sanity connection needed.

6. All data fetches use React Server Components.
   Use next: { revalidate: 3600 } on Sanity client fetches for ISR.
```

---

## Spec 4: SEO Infrastructure
> Paste this into Claude Code after Spec 3 is complete.

```
Add full SEO infrastructure to this Next.js App Router project.

1. app/sitemap.ts
   - Import getAllPosts from sanity/lib/queries.ts
   - Static routes:
       { url: '/', priority: 1, changeFrequency: 'weekly' }
       { url: '/about', priority: 0.7, changeFrequency: 'yearly' }
       { url: '/resume', priority: 0.7, changeFrequency: 'monthly' }
       { url: '/now', priority: 0.5, changeFrequency: 'monthly' }
   - Dynamic blog routes: map posts to /blog/[slug] with:
       lastModified: post.publishedAt
       changeFrequency: 'monthly'
       priority: 0.8

2. app/robots.ts
   - Allow all: { userAgent: '*', allow: '/' }
   - Sitemap: 'https://yoursite.com/sitemap.xml'

3. app/feed.xml/route.ts — RSS feed
   - Fetch all posts from Sanity
   - Return valid RSS 2.0 XML with Content-Type: application/rss+xml
   - Each item: title, link (/blog/[slug]), description (excerpt), pubDate, guid
   - The sidebar RSS link in layout.tsx must point to /feed.xml

4. app/blog/[slug]/page.tsx — JSON-LD structured data
   Add inside the page component:
   const jsonLd = {
     '@context': 'https://schema.org',
     '@type': 'BlogPosting',
     headline: post.title,
     description: post.excerpt,
     datePublished: post.publishedAt,
     dateModified: post.publishedAt,
     author: { '@type': 'Person', name: 'Your Name', url: 'https://yoursite.com' },
     url: `https://yoursite.com/blog/${slug}`,
   }
   Inject as:
   <script
     type="application/ld+json"
     dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
   />

5. next.config.ts — add headers:
   async headers() {
     return [{
       source: '/(.*)',
       headers: [
         { key: 'X-Robots-Tag', value: 'index, follow' },
         { key: 'X-Content-Type-Options', value: 'nosniff' },
       ]
     }]
   }

6. Performance audit — confirm these are in place, add if missing:
   - All images use next/image (not <img>)
   - Fonts loaded via next/font/google (confirmed Spec 1 — no CSS @import)
   - generateStaticParams on /blog/[slug]
   - No 'use client' on any data-fetching component

7. Create /public/default-og.png placeholder (1200x630px)
   Leave comment: // TODO: replace with real OG image before launch
```

---

## Phase 5: Manual Post-Build Checklist
> Do these yourself after all specs are complete and the site is deployed.

### Sanity CORS
- sanity.io/manage → your project → API → CORS Origins
- Add your Vercel production URL (https://yoursite.com)
- Add http://localhost:3000 for local dev

### Google Search Console
- search.google.com/search-console → Add property
- Verify via HTML meta tag — add the verification meta to root metadata in app/layout.tsx
- Submit sitemap: yoursite.com/sitemap.xml
- Check Coverage report after 3–5 days

### Update social links in sidebar
The sidebar has 7 hardcoded placeholder links. Replace with your real URLs in app/layout.tsx (or SidebarNav component):
- email → mailto:you@youremail.com
- x → https://x.com/yourhandle
- youtube → your Channel 1 URL (YouTube Shorts / tech lifestyle)
- tiktok → your TikTok profile
- instagram → your Instagram profile
- linkedin → your LinkedIn
- rss → /feed.xml (already wired)

### Resume PDF
- Export your resume as a PDF
- Drop it at /public/resume.pdf
- The "Download PDF" link already points there

### Replace placeholders before launch
- /public/default-og.png → real 1200x630 OG image
- metadataBase URL → your actual domain
- Author name in JSON-LD → your real name
- Site description in root metadata → real copy
- Site name → replace "Inkwell" with your actual name
- /now page content → your real current status (edit app/now/page.tsx directly)
- /about page content → your real bio (edit app/about/page.tsx directly)

### First content in Sanity Studio
- Log into yoursite.com/studio
- Fill in the resume singleton first — it's already there, just empty
- Write 2–3 blog posts before launch so the home page isn't empty
- Fill in seo.metaDescription on each post — this is what shows in Google results

---

## SEO Reference

### Priority chain for every page
1. Sanity seo.metaTitle / seo.metaDescription (manually set per post, highest priority)
2. post.title / post.excerpt (auto-fallback if seo fields are empty)
3. Root layout default (last resort)

Fill in the Sanity SEO fields on your most important posts first.

### Sitemap priority guidance
- `/` → 1.0
- `/blog/[slug]` → 0.8 (individual posts)
- `/about`, `/resume` → 0.7
- `/now` → 0.5 (personal status, not a search target)

### Why generateStaticParams matters
Posts built at deploy time load from Vercel's edge cache. Server-rendered posts hit a compute function on every request. Static wins for both speed and SEO.

### Why JSON-LD matters
Google uses structured data to understand content type, authorship, and publish date independently of your HTML. BlogPosting schema makes posts eligible for rich results in search.

### Why RSS matters
Some readers still use RSS readers. The sidebar links directly to /feed.xml. It also gives you a clean syndication endpoint if you ever want to cross-post automatically.

### What actually moves the needle
Technical SEO gets you indexed correctly. Rankings come from:
1. Publishing consistently
2. Writing that is specific and useful (not generic)
3. Internal links between related posts over time

The stack handles the infrastructure. The rest is writing.
