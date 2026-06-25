const PARAGRAPHS = [
  "Writing a longer piece about the rooms we leave behind, and how memory keeps redecorating them. It is fighting me, which usually means it is worth finishing.",
  "Reading slowly and on purpose: short stories before sleep, the same three poems most mornings. Trying to notice more and explain less.",
  "Otherwise: long walks, weak coffee, and a standing argument with the first sentence of everything.",
];

export default function NowPage() {
  return (
    <div className="max-w-[65ch]">
      <h1 className="text-[clamp(32px,4.5vw,50px)] font-bold leading-[1.05] tracking-[-0.025em] text-heading">
        Now
      </h1>
      <div className="mt-[18px] text-[13px] uppercase tracking-[0.05em] text-subtle">
        Updated June 2026
      </div>
      <div className="mt-[42px]">
        {PARAGRAPHS.map((para, i) => (
          <p
            key={i}
            className="mb-[1.5em] font-reading text-[19px] leading-[1.78] text-body"
          >
            {para}
          </p>
        ))}
      </div>
    </div>
  );
}
