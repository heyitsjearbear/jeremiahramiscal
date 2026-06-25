import ResumeSection, {
  type ResumeSectionData,
} from "@/components/ResumeSection";

const SECTIONS: ResumeSectionData[] = [
  {
    title: "Selected Publications",
    items: [
      { year: "2026", title: "The Long Way Around", detail: "Granta, online" },
      { year: "2025", title: "Notes on Silence", detail: "The Paris Review Daily" },
      { year: "2024", title: "Inventory of a Small Room", detail: "Tin House, issue 41" },
      { year: "2023", title: "Letters I Never Sent", detail: "Electric Literature" },
    ],
  },
  {
    title: "Experience",
    items: [
      {
        year: "2022 — now",
        title: "Contributing Essayist",
        detail: "Independent — essays, fiction & short-form video",
      },
      { year: "2019 — 22", title: "Staff Writer", detail: "The Atlas Review" },
      { year: "2017 — 19", title: "Copywriter", detail: "Field Notes Studio" },
    ],
  },
  {
    title: "Awards & Residencies",
    items: [
      { year: "2025", title: "Pushcart Prize", detail: "Nominated" },
      { year: "2024", title: "MacDowell Fellowship", detail: "Fiction residency" },
      { year: "2023", title: "Best of the Net", detail: "Finalist" },
    ],
  },
  {
    title: "Education",
    items: [
      { year: "2017", title: "MFA, Fiction", detail: "University of Iowa" },
      { year: "2015", title: "BA, English", detail: "Reed College" },
    ],
  },
];

export default function ResumePage() {
  return (
    <div className="max-w-[640px]">
      <h1 className="text-[clamp(32px,4.5vw,50px)] font-bold leading-[1.05] tracking-[-0.025em] text-heading">
        Resume
      </h1>
      <a
        href="/resume.pdf"
        className="mt-[18px] inline-block text-[13px] tracking-[0.02em] text-accent"
      >
        Download PDF ↓
      </a>
      {SECTIONS.map((section) => (
        <ResumeSection key={section.title} {...section} />
      ))}
    </div>
  );
}
