const PARAGRAPHS = [
  "sporadic, spontaneous, adhd-tendency, jack of all trades, etc. i am never focused on anything for more than 2 weeks, probably because my brain is fried from dopamine, but alas, here i am.",
  "i'm a computer science graduate who (SupSrisngly) haha has interests outside of tech (wowwww).",
  "this is a space for my unfiltered (though not trying to cancel myself) thoughts as i spearhead into my own self-development journey.",
  "i love shitposting, so i want to be able to look back a year from now and look at all the blog entries, different projects i've worked on, to see “what i haven't completed.”",
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
