import PostCard from "@/components/PostCard";
import { posts } from "@/lib/posts";

export default function Home() {
  return (
    <div className="max-w-[720px]">
      <div className="mb-12 text-[12px] uppercase tracking-[0.14em] text-faint">
        Selected writing
      </div>
      <div className="flex flex-col gap-post-gap">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
