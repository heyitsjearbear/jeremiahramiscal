// Single source of truth for site-wide identity strings.
// Domain need not be linked in Vercel yet — it only resolves absolute URLs
// (metadataBase, OG, sitemap, RSS). Point the real domain whenever; no code change.
export const SITE = {
  name: "Jeremiah Ramiscal",
  author: "Jeremiah Ramiscal",
  tagline: "Notes, essays & fiction by one person.",
  description:
    "Personal site of Jeremiah Ramiscal — essays, fiction, and creative writing.",
  url: "https://jeremiahramiscal.com",
} as const;
