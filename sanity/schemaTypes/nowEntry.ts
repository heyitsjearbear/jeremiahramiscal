import { defineArrayMember, defineField, defineType } from "sanity";

// Deliberately NOT a singleton (unlike `resume`). A singleton would be
// overwritten on every update, which destroys the trail — the whole point of
// /now here is that past entries stay published and stack down the page.
// Publish a new entry each time instead of editing the last one.
export const nowEntry = defineType({
  name: "nowEntry",
  title: "Now entry",
  type: "document",
  fields: [
    defineField({
      name: "effectiveFrom",
      title: "Effective from",
      type: "date",
      description:
        "The month this update speaks for. Newest entry becomes the live /now.",
      options: { dateFormat: "YYYY-MM-DD" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
      validation: (rule) => rule.required(),
    }),
  ],
  orderings: [
    {
      name: "newestFirst",
      title: "Newest first",
      by: [{ field: "effectiveFrom", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "effectiveFrom" },
    prepare: ({ title }) => ({ title: title ?? "(no date)" }),
  },
});
