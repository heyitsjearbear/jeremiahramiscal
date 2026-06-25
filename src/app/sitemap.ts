import type { MetadataRoute } from "next";
import { getAllPosts } from "@/sanity/lib/queries";
import { SITE } from "@/lib/site";

type PostRef = { slug: { current: string }; publishedAt?: string };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = (await getAllPosts()) as PostRef[];

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/about`, changeFrequency: "yearly", priority: 0.7 },
    { url: `${SITE.url}/resume`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/now`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE.url}/blog/${post.slug.current}`,
    lastModified: post.publishedAt ? new Date(post.publishedAt) : undefined,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...postRoutes];
}
