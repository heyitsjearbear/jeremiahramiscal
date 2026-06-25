import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, posts } from "@/lib/posts";

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-[65ch]">
      <Link
        href="/"
        className="text-[13px] tracking-[0.02em] text-accent"
      >
        ← Writing
      </Link>
      <h1 className="mt-[30px] text-[clamp(34px,5vw,58px)] font-bold leading-[1.05] tracking-[-0.025em] text-heading">
        {post.title}
      </h1>
      <div className="mt-5 text-[13px] uppercase tracking-[0.05em] text-subtle">
        {post.date} · {post.tags}
      </div>
      <div className="mt-[42px]">
        {post.body.map((para, i) => (
          <p
            key={i}
            className="mb-[1.5em] font-reading text-[19px] leading-[1.78] text-body"
          >
            {para}
          </p>
        ))}
      </div>
    </article>
  );
}
