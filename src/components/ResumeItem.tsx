export type ResumeItemData = {
  year: string;
  title: string;
  detail: string;
};

// Split a date range ("november 2025 — now") so each side can stay unbroken
// while the dash itself becomes the wrap point.
const RANGE_SEPARATOR = /\s*[—–]\s*|\s+-\s+/;

export default function ResumeItem({ year, title, detail }: ResumeItemData) {
  const dateParts = year.split(RANGE_SEPARATOR).filter(Boolean);

  return (
    <div className="mb-6 grid grid-cols-1 gap-x-5 gap-y-[6px] sm:mb-5 sm:grid-cols-[150px_1fr] sm:items-baseline sm:gap-y-0 lg:grid-cols-[184px_1fr]">
      <div className="text-[13px] leading-[1.4] tracking-[0.03em] text-syntax-number">
        {dateParts.map((part, i) => (
          <span key={`${part}-${i}`}>
            {i > 0 ? " — " : null}
            <span className="whitespace-nowrap">{part}</span>
          </span>
        ))}
      </div>
      <div className="min-w-0">
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
