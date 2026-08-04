/**
 * Second root layout, for /studio only.
 *
 * Studio renders a `height: 100vh` box of its own, so it has to own the whole
 * viewport. Under the site's root layout it inherited <main>'s 92px top padding
 * and ran off the bottom of the screen. Route groups let /studio bypass the
 * site chrome entirely — see node_modules/next/dist/docs/01-app/03-api-reference/
 * 03-file-conventions/layout.md ("You can create multiple root layouts").
 *
 * Deliberately does NOT import globals.css: Studio ships its own theme, and the
 * site's `body` background / `a` color resets bleed into it.
 */

// noindex + same-origin referrer, straight from next-sanity.
export { metadata, viewport } from "next-sanity/studio";

export default function StudioRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
