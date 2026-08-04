import ResumeContent from "@/components/ResumeContent";
import { getResume } from "@/sanity/lib/queries";

type ResumeItemData = { year?: string; title?: string; detail?: string };
type ResumeSectionData = { sectionTitle: string; items?: ResumeItemData[] };
type Resume = { sections?: ResumeSectionData[] } | null;

export default async function ResumePage() {
  const resume = (await getResume()) as Resume;
  const sections = (resume?.sections ?? []).map((section) => ({
    title: section.sectionTitle,
    items: (section.items ?? []).map((it) => ({
      year: it.year ?? "",
      title: it.title ?? "",
      detail: it.detail ?? "",
    })),
  }));

  return <ResumeContent sections={sections} />;
}
