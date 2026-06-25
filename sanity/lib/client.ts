import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, readToken } from "../env";

// Public, CDN-cached client — safe for client-side and anonymous reads.
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});

// Server-only client with a read token, for authenticated/fresh fetches.
// useCdn is false so token reads always hit the API; Next caching/revalidation
// is controlled per-fetch via the `next` request option (see queries.ts).
export const serverClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: readToken,
  perspective: "published",
});
