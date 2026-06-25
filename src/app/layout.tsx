import type { Metadata } from "next";
import { Space_Grotesk, Newsreader } from "next/font/google";
import "./globals.css";
import SidebarNav from "@/components/SidebarNav";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-space-grotesk",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-newsreader",
});

export const metadata: Metadata = {
  title: "Inkwell",
  description: "Notes, essays & fiction by one person.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${newsreader.variable} antialiased`}
    >
      <body>
        <SidebarNav />
        <main className="ml-0 px-6 pt-20 pb-24 md:ml-sidebar md:pt-main-t md:pr-main-r md:pb-main-b md:pl-main-l">
          {children}
        </main>
      </body>
    </html>
  );
}
