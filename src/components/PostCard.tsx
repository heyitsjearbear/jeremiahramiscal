import Link from "next/link";

export type PostCardProps = {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  tags?: string;
};

export default function PostCard({
  slug,
  title,
  date,
  excerpt,
  tags,
}: PostCardProps) {
  return (
    <article>
      <div className="text-[13px] uppercase tracking-[0.05em] text-subtle">
        {date}
      </div>
      <Link
        href={`/blog/${slug}`}
        className="mt-[11px] inline-block text-[clamp(28px,3.2vw,44px)] font-bold leading-[1.06] tracking-[-0.02em] text-primary transition-colors duration-150 hover:text-accent"
      >
        {title}
      </Link>
      {excerpt ? (
        <p className="mt-[13px] max-w-[560px] font-reading text-[18px] leading-[1.5] text-muted">
          {excerpt}
        </p>
      ) : null}
      {tags ? (
        <div className="mt-[13px] text-[13px] tracking-[0.02em] text-faintest">
          {tags}
        </div>
      ) : null}
    </article>
  );
}
