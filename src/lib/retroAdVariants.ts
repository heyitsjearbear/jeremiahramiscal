export type RetroAdVariant = {
  eyebrow: string;
  headline: string;
  marquee: string;
  cta: string;
  bg: string;
};

export const RETRO_AD_VARIANTS: RetroAdVariant[] = [
  {
    eyebrow: "★ SPECIAL OFFER ★",
    headline: "YOU ARE THE 1,000,000th VISITOR!!!",
    marquee: "CLICK HERE NOW * CLAIM YOUR PRIZE * LIMITED TIME * ACT FAST * ",
    cta: "CLICK HERE TO CLAIM →",
    bg: "linear-gradient(90deg,#ff0000,#ff9e00,#fff700,#00ff6a,#00c8ff,#a600ff,#ff0000)",
  },
  {
    eyebrow: "⚡ HOT NEW DOWNLOAD ⚡",
    headline: "MAKE MONEY FAST WITH THIS ONE WEIRD TRICK",
    marquee: "100% FREE * NO CATCH * AS SEEN ON THE INTERNET * ",
    cta: "DOWNLOAD NOW",
    bg: "linear-gradient(90deg,#ff00c8,#7000ff,#00e0ff)",
  },
  {
    eyebrow: "JOIN THE WEBRING",
    headline: "THIS SITE IS UNDER CONSTRUCTION",
    marquee: "BEST VIEWED IN 800x600 * NETSCAPE NAVIGATOR RECOMMENDED * ",
    cta: "[ prev | random | next ]",
    bg: "linear-gradient(90deg,#ffe600,#ff7a00)",
  },
  {
    eyebrow: "☆ NEW! ☆",
    headline: "PUNCH THE MONKEY TO WIN A FREE LAPTOP",
    marquee: "EVERYONE IS A WINNER * NO PURCHASE NECESSARY * HURRY * ",
    cta: "PUNCH HERE",
    bg: "linear-gradient(90deg,#00ff6a,#00c8ff,#ff00c8)",
  },
  {
    eyebrow: "!! WARNING !!",
    headline: "YOUR COMPUTER MAY BE INFECTED",
    marquee: "SCAN NOW FOR FREE * REMOVE THREATS INSTANTLY * ",
    cta: "SCAN NOW",
    bg: "linear-gradient(90deg,#ff0000,#ffe600)",
  },
];

export const RETRO_AD_VARIANT_COUNT = RETRO_AD_VARIANTS.length;
