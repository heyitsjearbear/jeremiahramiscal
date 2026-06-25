"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Writing", href: "/" },
  { label: "Resume", href: "/resume" },
  { label: "About", href: "/about" },
  { label: "Now", href: "/now" },
];

const SOCIAL_LINKS = [
  { label: "email", href: "mailto:hello@example.com" },
  { label: "x", href: "https://x.com" },
  { label: "youtube", href: "https://youtube.com" },
  { label: "tiktok", href: "https://tiktok.com" },
  { label: "instagram", href: "https://instagram.com" },
  { label: "linkedin", href: "https://linkedin.com" },
  { label: "rss", href: "/rss.xml" },
];

export default function SidebarNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/" || pathname.startsWith("/blog")
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="flex w-full flex-col justify-between gap-8 px-6 py-8 md:fixed md:left-0 md:top-0 md:h-screen md:w-sidebar md:gap-0 md:px-sb-x md:pt-sb-t md:pb-sb-b">
      <div>
        <Link href="/" className="block">
          <div className="text-[19px] font-bold tracking-[-0.02em] text-primary">
            Inkwell
          </div>
          <div className="mt-[7px] text-[12px] leading-[1.45] text-subtle">
            Notes, essays &amp; fiction by one person.
          </div>
        </Link>

        <nav className="mt-[42px] flex flex-row flex-wrap items-start gap-x-5 gap-y-[13px] md:flex-col">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[14.5px] transition-transform duration-150 hover:translate-x-[3px] ${
                  active
                    ? "font-medium text-primary"
                    : "font-normal text-subtle"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-wrap items-center gap-x-[14px] gap-y-[7px]">
        {SOCIAL_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="text-[12px] tracking-[0.03em] text-faint transition-colors duration-150 hover:text-accent"
          >
            {link.label}
          </a>
        ))}
      </div>
    </aside>
  );
}
