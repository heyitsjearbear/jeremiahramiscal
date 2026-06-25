import PostCard from "@/components/PostCard";
import { getAllPosts } from "@/sanity/lib/queries";
import { formatDate } from "@/lib/format";

type PostListItem = {
  title: string;
  slug: { current: string };
  excerpt?: string;
  publishedAt?: string;
  category?: string;
};

export default async function Home() {
  const posts = (await getAllPosts()) as PostListItem[];

  return (
    <div className="max-w-[720px]">
      <div className="mb-12 text-[12px] uppercase tracking-[0.14em] text-faint">
        Selected writing
      </div>
      <div className="flex flex-col gap-post-gap">
        {posts.map((post) => (
          <PostCard
            key={post.slug.current}
            slug={post.slug.current}
            title={post.title}
            date={formatDate(post.publishedAt)}
            excerpt={post.excerpt}
            tags={post.category}
          />
        ))}
      </div>
    </div>
  );
}
