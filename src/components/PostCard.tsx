import Link from "next/link";
import type { Post } from "@/lib/posts";

export default function PostCard({ post }: { post: Post }) {
  return (
    <article>
      <div className="text-[13px] uppercase tracking-[0.05em] text-subtle">
        {post.date}
      </div>
      <Link
        href={`/blog/${post.slug}`}
        className="mt-[11px] inline-block text-[clamp(28px,3.2vw,44px)] font-bold leading-[1.06] tracking-[-0.02em] text-primary transition-colors duration-150 hover:text-accent"
      >
        {post.title}
      </Link>
      <p className="mt-[13px] max-w-[560px] font-reading text-[18px] leading-[1.5] text-muted">
        {post.excerpt}
      </p>
      <div className="mt-[13px] text-[13px] tracking-[0.02em] text-faintest">
        {post.tags}
      </div>
    </article>
  );
}
