import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { PortableTextBlock } from "@portabletext/react";
import PortableBody from "@/components/PortableBody";
import { getAllPostSlugs, getPost } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import { formatDate } from "@/lib/format";
import { SITE } from "@/lib/site";

type Post = {
  title: string;
  slug: { current: string };
  excerpt?: string;
  publishedAt?: string;
  category?: string;
  body?: PortableTextBlock[];
  featuredImage?: { alt?: string };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: unknown;
  };
};

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = (await getPost(slug)) as Post | null;
  if (!post) return {};

  const title = post.seo?.metaTitle || post.title;
  const description = post.seo?.metaDescription || post.excerpt || "";
  const url = `${SITE.url}/blog/${slug}`;
  const ogImage = post.seo?.ogImage
    ? urlFor(post.seo.ogImage as never).width(1200).height(630).url()
    : // TODO: replace /public/default-og.png with a real 1200x630 OG image before launch
      "/default-og.png";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.publishedAt,
      url,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = (await getPost(slug)) as Post | null;

  if (!post) {
    notFound();
  }

  const meta = [formatDate(post.publishedAt), post.category]
    .filter(Boolean)
    .join(" · ");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { "@type": "Person", name: SITE.author, url: SITE.url },
    url: `${SITE.url}/blog/${slug}`,
  };

  return (
    <article className="max-w-[65ch]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link href="/" className="text-[13px] tracking-[0.02em] text-accent">
        ← Writing
      </Link>
      <h1 className="mt-[30px] text-[clamp(34px,5vw,58px)] font-bold leading-[1.05] tracking-[-0.025em] text-heading">
        {post.title}
      </h1>
      {meta ? (
        <div className="mt-5 text-[13px] uppercase tracking-[0.05em] text-subtle">
          {meta}
        </div>
      ) : null}
      <div className="mt-[42px]">
        {post.body ? <PortableBody value={post.body} /> : null}
      </div>
    </article>
  );
}
