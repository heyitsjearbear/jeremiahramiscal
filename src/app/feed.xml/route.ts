import { getAllPosts } from "@/sanity/lib/queries";
import { SITE } from "@/lib/site";

type FeedPost = {
  title: string;
  slug: { current: string };
  excerpt?: string;
  publishedAt?: string;
};

// Escape the five XML predefined entities so titles/excerpts can't break the feed.
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = (await getAllPosts()) as FeedPost[];

  const items = posts
    .map((post) => {
      const link = `${SITE.url}/blog/${post.slug.current}`;
      const pubDate = post.publishedAt
        ? new Date(post.publishedAt).toUTCString()
        : "";
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <description>${escapeXml(post.excerpt ?? "")}</description>
      ${pubDate ? `<pubDate>${pubDate}</pubDate>` : ""}
      <guid isPermaLink="true">${link}</guid>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.name)}</title>
    <link>${SITE.url}</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>en</language>
    <atom:link href="${SITE.url}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
