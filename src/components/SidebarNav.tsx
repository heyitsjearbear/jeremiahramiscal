"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/lib/site";

const NAV_ITEMS = [
  { label: "Writing", href: "/" },
  { label: "Resume", href: "/resume" },
  { label: "About", href: "/about" },
  { label: "Now", href: "/now" },
];

const SOCIAL_LINKS = [
  { label: "x", href: "https://x.com/jeremiahyaps" },
  { label: "youtube", href: "https://www.youtube.com/@heyitsjearbear" },
  { label: "twitch", href: "https://www.twitch.tv/heyitsjearbear" },
  { label: "tiktok", href: "https://www.tiktok.com/@jeremiahyaps" },
  { label: "instagram", href: "https://www.instagram.com/jeremiahyaps/" },
  { label: "linkedin", href: "https://www.linkedin.com/in/jeremiah-ramiscal/" },
];

export default function SidebarNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/" || pathname.startsWith("/blog")
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="flex w-full flex-col justify-between gap-8 bg-sidebar px-6 py-8 md:fixed md:left-0 md:top-0 md:h-screen md:w-sidebar md:gap-0 md:px-sb-x md:pt-sb-t md:pb-sb-b">
      <div>
        <Link href="/" className="block">
          <div className="text-[16.5px] font-bold tracking-[-0.02em]">
            <span className="text-syntax-keyword">const</span>{" "}
            <span className="text-syntax-function">me</span>
            <span className="text-primary"> = </span>
            <span className="text-syntax-string">
              &quot;{SITE.name}&quot;
            </span>
            <span className="text-syntax-comment">;</span>
          </div>
          <div className="mt-[7px] text-[12px] italic leading-[1.45] text-syntax-comment">
            // {SITE.tagline}
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
                    ? "font-medium text-syntax-keyword"
                    : "font-normal text-subtle"
                }`}
              >
                <span className="text-syntax-function">
                  {item.label.toLowerCase()}
                </span>
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
            <span className="text-syntax-type">.</span>
            {link.label}
          </a>
        ))}
      </div>
    </aside>
  );
}
