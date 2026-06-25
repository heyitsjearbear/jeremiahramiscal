import { groq } from "next-sanity";
import { serverClient } from "./client";

// Revalidate cached fetches once an hour by default.
const REVALIDATE = 3600;

const allPostsQuery = groq`
  *[_type == "post"] | order(publishedAt desc) {
    title,
    slug,
    excerpt,
    publishedAt,
    category
  }
`;

const postQuery = groq`
  *[_type == "post" && slug.current == $slug][0] {
    title,
    slug,
    excerpt,
    publishedAt,
    category,
    body,
    featuredImage,
    seo
  }
`;

const allPostSlugsQuery = groq`
  *[_type == "post" && defined(slug.current)]{ "slug": slug.current }
`;

const resumeQuery = groq`
  *[_type == "resume"][0] {
    sections[] {
      sectionTitle,
      items[] {
        year,
        title,
        detail
      }
    }
  }
`;

export async function getAllPosts() {
  return serverClient.fetch(
    allPostsQuery,
    {},
    { next: { revalidate: REVALIDATE } },
  );
}

export async function getPost(slug: string) {
  return serverClient.fetch(
    postQuery,
    { slug },
    { next: { revalidate: REVALIDATE } },
  );
}

export async function getAllPostSlugs(): Promise<{ slug: string }[]> {
  return serverClient.fetch(allPostSlugsQuery, {}, { next: { revalidate: REVALIDATE } });
}

export async function getResume() {
  return serverClient.fetch(
    resumeQuery,
    {},
    { next: { revalidate: REVALIDATE } },
  );
}
