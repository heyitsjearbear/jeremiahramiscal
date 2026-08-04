"use client";

import { useEffect, useState } from "react";
import { RETRO_AD_VARIANTS } from "@/lib/retroAdVariants";

function HitCounter() {
  const [count, setCount] = useState(42);

  useEffect(() => {
    setCount(100000 + Math.floor(Math.random() * 899999));
    const id = setInterval(() => setCount((c) => c + 1), 1400);
    return () => clearInterval(id);
  }, []);

  const digits = String(count).padStart(6, "0").split("");

  return (
    <div className="flex items-center gap-[3px]">
      {digits.map((d, i) => (
        <span
          key={i}
          className="flex h-[16px] w-[11px] items-center justify-center bg-black font-mono text-[11px] font-bold text-[#00ff41]"
        >
          {d}
        </span>
      ))}
    </div>
  );
}

export default function RetroAd({
  index = 0,
  orientation = "vertical",
  className = "",
  style,
}: {
  index?: number;
  orientation?: "vertical" | "horizontal";
  className?: string;
  style?: React.CSSProperties;
}) {
  const variant =
    RETRO_AD_VARIANTS[
      ((index % RETRO_AD_VARIANTS.length) + RETRO_AD_VARIANTS.length) %
        RETRO_AD_VARIANTS.length
    ];

  return (
    <div
      className={`retro-bevel retro-wiggle select-none bg-black p-[6px] ${
        orientation === "vertical" ? "w-[160px]" : "w-full"
      } ${className}`}
      style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", cursive', ...style }}
    >
      <div
        className="retro-rainbow retro-shine relative flex items-center justify-center px-[20px] py-[3px]"
        style={{ background: variant.bg }}
      >
        <span className="retro-blink text-center text-[10px] font-bold uppercase text-black">
          {variant.eyebrow}
        </span>
        <span className="absolute right-[6px] text-[10px] font-bold text-black">
          ✕
        </span>
      </div>

      <div
        className={`px-[8px] py-[10px] text-center text-[13px] font-bold leading-[1.25] text-white ${
          orientation === "horizontal" ? "" : ""
        }`}
      >
        {variant.headline}
      </div>

      <div className="overflow-hidden border-y-2 border-dashed border-[#f4f4f4] bg-[#0000cc] py-[3px]">
        <span className="retro-marquee-track text-[11px] font-bold text-[#fff700]">
          {variant.marquee}
          {variant.marquee}
        </span>
      </div>

      <div className="flex flex-col items-center gap-[6px] px-[6px] py-[8px]">
        <button
          type="button"
          className="retro-bevel bg-[#c0c0c0] px-[10px] py-[4px] text-[11px] font-bold text-black active:border-[#444_#f4f4f4_#f4f4f4_#444]"
        >
          {variant.cta}
        </button>
        <div className="flex items-center gap-[6px] text-[9px] text-[#00ff41]">
          <span className="font-mono">VISITORS:</span>
          <HitCounter />
        </div>
      </div>
    </div>
  );
}
