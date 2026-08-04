import type { PortableTextBlock } from "@portabletext/react";
import PortableBody from "@/components/PortableBody";
import { getNowEntries } from "@/sanity/lib/queries";
import { formatMonth } from "@/lib/format";

type NowEntry = {
  _id: string;
  effectiveFrom: string;
  body?: PortableTextBlock[];
};

function Stamp({ date }: { date: string }) {
  return (
    <div className="text-[13px] uppercase tracking-[0.05em] text-syntax-comment">
      <span className="italic">// updated</span>{" "}
      <span className="text-syntax-number">{formatMonth(date)}</span>
    </div>
  );
}

export default async function NowPage() {
  const entries = (await getNowEntries()) as NowEntry[];
  // Newest entry is the live "now"; everything after it is the trail below it.
  const [current, ...past] = entries;

  return (
    <div className="max-w-[65ch]">
      <h1 className="text-[clamp(32px,4.5vw,50px)] font-bold leading-[1.05] tracking-[-0.025em] text-heading">
        Now
      </h1>

      {current ? (
        <>
          <div className="mt-[18px]">
            <Stamp date={current.effectiveFrom} />
          </div>
          <div className="mt-[42px]">
            {current.body ? <PortableBody value={current.body} /> : null}
          </div>
        </>
      ) : (
        <p className="mt-[42px] font-reading text-[19px] leading-[1.78] text-subtle">
          Nothing here yet.
        </p>
      )}

      {past.length ? (
        <div className="mt-[80px] border-t border-faintest pt-[42px]">
          <div className="text-[13px] uppercase tracking-[0.05em] text-syntax-comment">
            <span className="italic">// previously</span>
          </div>
          {past.map((entry) => (
            <section key={entry._id} className="mt-[58px] opacity-70">
              <Stamp date={entry.effectiveFrom} />
              <div className="mt-[24px]">
                {entry.body ? <PortableBody value={entry.body} /> : null}
              </div>
            </section>
          ))}
        </div>
      ) : null}
    </div>
  );
}
