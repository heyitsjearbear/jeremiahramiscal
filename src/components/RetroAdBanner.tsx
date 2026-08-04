"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import RetroAd from "./RetroAd";
import { RETRO_AD_VARIANT_COUNT } from "@/lib/retroAdVariants";

type BannerLayout = {
  variantIndex: number;
  marginBottom: number;
  rotate: number;
};

const STABLE_LAYOUT: BannerLayout = {
  variantIndex: 0,
  marginBottom: 32,
  rotate: 0,
};

function randomLayout(): BannerLayout {
  return {
    variantIndex: Math.floor(Math.random() * RETRO_AD_VARIANT_COUNT),
    marginBottom: 24 + Math.random() * 40,
    rotate: Math.random() * 3 - 1.5,
  };
}

export default function RetroAdBanner() {
  const pathname = usePathname();
  const [layout, setLayout] = useState<BannerLayout>(STABLE_LAYOUT);

  useEffect(() => {
    setLayout(randomLayout());
  }, [pathname]);

  return (
    <div
      className="flex w-full justify-center overflow-hidden min-[1320px]:hidden"
      style={{ marginBottom: layout.marginBottom }}
    >
      <RetroAd
        key={pathname}
        index={layout.variantIndex}
        orientation="horizontal"
        className="max-w-[360px]"
        style={{ transform: `rotate(${layout.rotate}deg)` }}
      />
    </div>
  );
}
