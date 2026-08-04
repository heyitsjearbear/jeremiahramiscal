export type ResumeItemData = {
  year: string;
  title: string;
  detail: string;
};

export default function ResumeItem({ year, title, detail }: ResumeItemData) {
  return (
    <div className="mb-5 grid grid-cols-[96px_1fr] items-baseline gap-5">
      <div className="whitespace-nowrap text-[13px] tracking-[0.03em] text-syntax-number">
        {year}
      </div>
      <div>
        <div className="text-[16px] font-medium leading-[1.35] text-syntax-function">
          {title}
        </div>
        <div className="mt-[3px] font-reading text-[15px] leading-[1.4] text-resume-detail">
          {detail}
        </div>
      </div>
    </div>
  );
}
