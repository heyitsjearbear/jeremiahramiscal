"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import RetroAd from "./RetroAd";
import { RETRO_AD_VARIANT_COUNT } from "@/lib/retroAdVariants";

const AD_COUNT = 3;

type AdLayout = {
  variantIndex: number;
  marginTop: number;
  offsetX: number;
  rotate: number;
};

const STABLE_LAYOUT: AdLayout[] = Array.from({ length: AD_COUNT }, (_, i) => ({
  variantIndex: i,
  marginTop: i === 0 ? 0 : 24,
  offsetX: 0,
  rotate: 0,
}));

function randomLayout(): AdLayout[] {
  return Array.from({ length: AD_COUNT }, (_, i) => ({
    variantIndex: Math.floor(Math.random() * RETRO_AD_VARIANT_COUNT),
    marginTop: i === 0 ? Math.random() * 30 : 10 + Math.random() * 60,
    offsetX: Math.random() * 40 - 10,
    rotate: Math.random() * 6 - 3,
  }));
}

export default function RetroAdRail() {
  const pathname = usePathname();
  const [layout, setLayout] = useState<AdLayout[]>(STABLE_LAYOUT);

  useEffect(() => {
    setLayout(randomLayout());
  }, [pathname]);

  return (
    <aside className="fixed top-[92px] right-[24px] hidden flex-col min-[1320px]:flex">
      {layout.map((ad, i) => (
        <div
          key={`${pathname}-${i}`}
          style={{
            marginTop: ad.marginTop,
            transform: `translateX(${ad.offsetX}px) rotate(${ad.rotate}deg)`,
          }}
        >
          <RetroAd index={ad.variantIndex} />
        </div>
      ))}
    </aside>
  );
}
