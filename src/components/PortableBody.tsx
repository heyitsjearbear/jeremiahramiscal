import {
  PortableText,
  type PortableTextComponents,
  type PortableTextBlock,
} from "@portabletext/react";

/*
  Every style/decorator the default Sanity `block` type exposes is handled here.
  Tailwind's preflight strips native heading/blockquote/list styling, so any
  style left to the library's default renderer shows up as plain body text —
  that's why h1 and h4-h6 need explicit entries even though they "worked" in
  the Studio editor.

  Body type: reading font at 19px / 1.78. Headings use the sans stack and step
  down from the post title (clamp 34-58px), so body h1 tops out at 32px.
*/
const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mb-[1.5em] font-reading text-[19px] leading-[1.78] text-body">
        {children}
      </p>
    ),
    h1: ({ children }) => (
      <h1 className="mt-[1.4em] mb-[0.5em] text-[clamp(26px,3.4vw,32px)] font-bold leading-[1.15] tracking-[-0.025em] text-heading">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mt-[1.2em] mb-[0.5em] text-[clamp(23px,3vw,28px)] font-bold leading-[1.2] tracking-[-0.02em] text-heading">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-[1.2em] mb-[0.4em] text-[clamp(20px,2.4vw,22px)] font-bold leading-[1.25] tracking-[-0.02em] text-heading">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="mt-[1.2em] mb-[0.4em] text-[18px] font-bold leading-[1.3] tracking-[-0.01em] text-heading">
        {children}
      </h4>
    ),
    h5: ({ children }) => (
      <h5 className="mt-[1.2em] mb-[0.35em] text-[16px] font-semibold leading-[1.35] tracking-[0.01em] text-resume-title">
        {children}
      </h5>
    ),
    h6: ({ children }) => (
      <h6 className="mt-[1.2em] mb-[0.35em] text-[14px] font-semibold uppercase tracking-[0.08em] text-muted">
        {children}
      </h6>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-[1.5em] border-l-2 border-faint pl-[1.1em] font-reading text-[19px] italic leading-[1.7] text-muted">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mb-[1.5em] list-disc pl-[1.4em] font-reading text-[19px] leading-[1.78] text-body marker:text-subtle">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="mb-[1.5em] list-decimal pl-[1.4em] font-reading text-[19px] leading-[1.78] text-body marker:text-subtle">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => (
      <li className="mb-[0.4em] [&>ul]:mt-[0.4em] [&>ul]:mb-0 [&>ol]:mt-[0.4em] [&>ol]:mb-0">
        {children}
      </li>
    ),
    number: ({ children }) => (
      <li className="mb-[0.4em] [&>ul]:mt-[0.4em] [&>ul]:mb-0 [&>ol]:mt-[0.4em] [&>ol]:mb-0">
        {children}
      </li>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-heading">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    underline: ({ children }) => (
      <span className="underline decoration-faint underline-offset-[3px]">
        {children}
      </span>
    ),
    "strike-through": ({ children }) => (
      <s className="text-subtle line-through decoration-faint">{children}</s>
    ),
    code: ({ children }) => (
      <code className="rounded-[4px] bg-white/[0.06] px-[0.4em] py-[0.15em] font-mono text-[0.85em] text-syntax-string">
        {children}
      </code>
    ),
    link: ({ children, value }) => {
      const href = value?.href ?? "#";
      const external = /^https?:\/\//.test(href);
      return (
        <a
          href={href}
          className="text-accent underline underline-offset-2"
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {children}
        </a>
      );
    },
  },
  // A `code` *block* (as opposed to the inline decorator) only appears if the
  // schema adds one; render it readably rather than as bare text if it does.
  types: {
    code: ({ value }: { value?: { code?: string; language?: string } }) => (
      <pre className="mb-[1.5em] overflow-x-auto rounded-md bg-white/[0.04] p-4 text-[14px] leading-[1.6]">
        <code className="font-mono text-body">{value?.code ?? ""}</code>
      </pre>
    ),
  },
};

export default function PortableBody({ value }: { value: PortableTextBlock[] }) {
  return <PortableText value={value} components={components} />;
}
