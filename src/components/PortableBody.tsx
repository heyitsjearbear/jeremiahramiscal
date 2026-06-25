import {
  PortableText,
  type PortableTextComponents,
  type PortableTextBlock,
} from "@portabletext/react";

// Reading-font body type matching the single-post spec (19px / 1.78 / text-body).
const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mb-[1.5em] font-reading text-[19px] leading-[1.78] text-body">
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h2 className="mt-[1.2em] mb-[0.5em] text-[28px] font-bold tracking-[-0.02em] text-heading">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-[1.2em] mb-[0.4em] text-[22px] font-bold tracking-[-0.02em] text-heading">
        {children}
      </h3>
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
    bullet: ({ children }) => <li className="mb-[0.4em]">{children}</li>,
    number: ({ children }) => <li className="mb-[0.4em]">{children}</li>,
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-heading">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
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
};

export default function PortableBody({ value }: { value: PortableTextBlock[] }) {
  return <PortableText value={value} components={components} />;
}
