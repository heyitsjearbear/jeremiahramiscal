"use client";

/**
 * Embedded Sanity Studio, served at /studio.
 * Studio renders entirely client-side and must not be statically optimized.
 */

import { NextStudio } from "next-sanity/studio";
// Five levels up: [[...tool]] → studio → (studio) → app → src → repo root.
import config from "../../../../../sanity.config";

export const dynamic = "force-dynamic";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
