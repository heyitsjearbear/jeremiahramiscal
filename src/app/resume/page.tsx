import ResumeSection from "@/components/ResumeSection";
import { getResume } from "@/sanity/lib/queries";

type ResumeItemData = { year?: string; title?: string; detail?: string };
type ResumeSectionData = { sectionTitle: string; items?: ResumeItemData[] };
type Resume = { sections?: ResumeSectionData[] } | null;

export default async function ResumePage() {
  const resume = (await getResume()) as Resume;
  const sections = resume?.sections ?? [];

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
      {sections.map((section) => (
        <ResumeSection
          key={section.sectionTitle}
          title={section.sectionTitle}
          items={(section.items ?? []).map((it) => ({
            year: it.year ?? "",
            title: it.title ?? "",
            detail: it.detail ?? "",
          }))}
        />
      ))}
    </div>
  );
}
