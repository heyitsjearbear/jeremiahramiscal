"use client";

/**
 * Embedded Sanity Studio, served at /studio.
 * Studio renders entirely client-side and must not be statically optimized.
 */

import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";

export const dynamic = "force-dynamic";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
