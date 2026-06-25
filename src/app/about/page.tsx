const PARAGRAPHS = [
  "I write to find out what I think. Inkwell is where the drafts go to become something firmer — essays when I want to argue with myself, fiction when the truth is easier sideways.",
  "There is no team here, no calendar, no growth strategy. A post arrives when it is ready and not before. I would rather publish six honest sentences a month than a thousand tidy ones a week.",
  "If something here stays with you, that is the whole point. You can reach me by email — I read everything, even when I am slow to answer.",
];

export default function AboutPage() {
  return (
    <div className="max-w-[65ch]">
      <h1 className="text-[clamp(32px,4.5vw,50px)] font-bold leading-[1.05] tracking-[-0.025em] text-heading">
        About
      </h1>
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
