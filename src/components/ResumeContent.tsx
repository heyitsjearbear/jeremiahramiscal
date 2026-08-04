"use client";

import { useRef, useState } from "react";
import ResumeSection, { type ResumeSectionData } from "@/components/ResumeSection";

function playThud(delay: number, pitch: number) {
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtx) return;

  window.setTimeout(() => {
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = 180 * pitch;
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.09);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.09);
    osc.onended = () => ctx.close();
  }, delay);
}

export default function ResumeContent({
  sections,
}: {
  sections: ResumeSectionData[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [falling, setFalling] = useState(false);

  function handleDownload() {
    if (falling) return;
    setFalling(true);

    const container = containerRef.current;
    if (!container) return;

    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (node.textContent && node.textContent.trim().length > 0) {
        textNodes.push(node as Text);
      }
    }

    const spans: HTMLSpanElement[] = [];
    textNodes.forEach((textNode) => {
      const parent = textNode.parentNode;
      if (!parent) return;
      const frag = document.createDocumentFragment();
      textNode.textContent!.split("").forEach((ch) => {
        const span = document.createElement("span");
        span.textContent = ch === " " ? " " : ch;
        span.style.display = "inline-block";
        span.style.willChange = "transform";
        frag.appendChild(span);
        spans.push(span);
      });
      parent.replaceChild(frag, textNode);
    });

    const vh = window.innerHeight;
    let maxFinish = 0;

    spans.forEach((span) => {
      const rect = span.getBoundingClientRect();
      const fallDistance = vh - rect.bottom + 40;
      const duration = 600 + Math.random() * 700;
      const delay = Math.random() * 450;
      const rotate = (Math.random() - 0.5) * 720;
      const drift = (Math.random() - 0.5) * 90;

      span.style.position = "relative";
      span.style.transition = `transform ${duration}ms cubic-bezier(.55,0,1,.45) ${delay}ms`;

      requestAnimationFrame(() => {
        span.style.transform = `translate(${drift}px, ${fallDistance}px) rotate(${rotate}deg)`;
      });

      playThud(delay + duration - 60, 0.75 + Math.random() * 0.6);
      maxFinish = Math.max(maxFinish, delay + duration);
    });

    window.setTimeout(() => {
      window.location.reload();
    }, maxFinish + 500);
  }

  return (
    <div ref={containerRef} className="max-w-[640px]">
      <h1 className="text-[clamp(32px,4.5vw,50px)] font-bold leading-[1.05] tracking-[-0.025em] text-heading">
        Resume
      </h1>
      <button
        type="button"
        onClick={handleDownload}
        className="mt-[18px] inline-block cursor-pointer text-[13px] tracking-[0.02em] text-accent"
      >
        Download PDF ↓
      </button>
      {sections.map((section) => (
        <ResumeSection
          key={section.title}
          title={section.title}
          items={section.items}
        />
      ))}
    </div>
  );
}
