import ResumeItem, { type ResumeItemData } from "./ResumeItem";

export type ResumeSectionData = {
  title: string;
  items: ResumeItemData[];
};

export default function ResumeSection({ title, items }: ResumeSectionData) {
  return (
    <div className="mt-[50px]">
      <div className="mb-[22px] text-[12px] uppercase tracking-[0.14em] text-faint">
        {title}
      </div>
      {items.map((item) => (
        <ResumeItem key={`${item.year}-${item.title}`} {...item} />
      ))}
    </div>
  );
}
