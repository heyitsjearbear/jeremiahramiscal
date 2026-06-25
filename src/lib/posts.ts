export type Post = {
  slug: string;
  title: string;
  date: string;
  tags: string;
  excerpt: string;
  body: string[];
};

export const posts: Post[] = [
  {
    slug: "long-way-around",
    title: "The Long Way Around",
    date: "June 12, 2026",
    tags: "fiction",
    excerpt:
      "On detours, and why the shortest path is rarely the one worth remembering.",
    body: [
      "We took the road that nobody recommends, the one that adds an hour and a half and a flat stretch of nothing in the middle. My father called it the scenic route, which was generous, because for the first forty minutes there is nothing scenic about it at all.",
      "But that is the thing about the long way around. It asks for patience before it offers anything, and most people turn back before the offering. They take the highway, arrive on time, and remember nothing.",
      "Somewhere past the grain silos the land finally opens. The sky does something it never does over the freeway. And you understand, too late to do anything useful with the knowledge, that the destination was never the point.",
      "I have been taking the long way around ever since. Not because it is wiser. Because the short way leaves me with so little to keep.",
    ],
  },
  {
    slug: "notes-on-silence",
    title: "Notes on Silence",
    date: "May 28, 2026",
    tags: "essay",
    excerpt: "A month without writing a single word, and everything it gave back.",
    body: [
      "For thirty-one days I wrote nothing. Not a journal entry, not a note, not a list. I wanted to find out whether the part of me that needs to write was a hunger or only a habit.",
      "The first week was loud. My head kept composing sentences for an audience that was not there, narrating the morning, editing the afternoon. I had not realized how much of my attention I spent translating life into language instead of living it.",
      "By the third week the narration quieted. Things began to happen to me without immediately becoming material. A conversation could just be a conversation. A loss could just be a loss.",
      "When I finally wrote again, the silence had changed what came out. Fewer words, more weight. It turns out the writing was never the hunger. The noticing was. The writing is only what I do with what I notice.",
    ],
  },
  {
    slug: "inventory-small-room",
    title: "Inventory of a Small Room",
    date: "May 9, 2026",
    tags: "writing · essay",
    excerpt: "Everything I own, and what it refuses to say about me.",
    body: [
      "A bed, a lamp, a chair that no longer matches anything. Forty-one books, most of them read, three of them many times. A coffee cup with a hairline crack I keep meaning to throw out and never will.",
      "We are told that our things describe us, that a room is a kind of confession. I am not sure I believe it. My room does not describe me so much as it describes the version of me that had the money, the energy, or the indifference to buy each object on the day I bought it.",
      "What the inventory leaves out is everything that matters. The argument that happened by the window. The afternoon light I have watched a thousand times and never owned. The silence after the door closes.",
      "You can list a life. You cannot inventory it. The important things were never things.",
    ],
  },
  {
    slug: "letters-i-never-sent",
    title: "Letters I Never Sent",
    date: "April 21, 2026",
    tags: "fiction",
    excerpt: "Drafts to people who would not recognize themselves in them.",
    body: [
      "There is a folder on my desk, real paper, that holds the letters I wrote and did not send. Some are kind. Most are honest, which is a different thing. A few are cruel in the careful way you can only manage with someone you once loved.",
      "I used to think not sending them was cowardice. Now I think it might be mercy, mostly toward myself. The letters did their work in the writing. By the time the ink dried I had said the thing, and the saying was enough.",
      "The strange part is that the people in them have moved on. They are out there living lives that no longer include me, unaware that some version of them lives in a folder on my desk, frozen at the worst or best moment we ever had.",
      "I will not send these. But I cannot throw them out either. They are the only honest letters I have ever written, and honesty, it turns out, is the one thing I have never been able to mail.",
    ],
  },
  {
    slug: "on-beginnings",
    title: "On Beginnings",
    date: "March 30, 2026",
    tags: "essay",
    excerpt: "Why the first sentence is a lie, and why I keep telling it.",
    body: [
      "Every first sentence is a small dishonesty. It pretends the story starts here, at this moment, with these words, when in truth the story started long before and the writer simply chose a door.",
      "I spend more time on beginnings than on anything else. Not because they are hardest to write, but because they are the only part the reader is guaranteed to reach. Everything after is a negotiation. The beginning is a promise.",
      "The trick I have learned is to begin in motion. Not to explain, not to set the table, but to start as if the reader has already been here a while and only just looked up.",
      "It is a lie, of course. They have not been here at all. But a good beginning makes them feel they have, and that feeling is the whole contract. The rest of the piece is just me keeping the promise I made in the first line.",
    ],
  },
];

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
