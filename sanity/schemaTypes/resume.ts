import { defineArrayMember, defineField, defineType } from "sanity";

export const resume = defineType({
  name: "resume",
  title: "Resume",
  type: "document",
  // Singleton — create/delete/duplicate are stripped in sanity.config.ts via
  // document.actions + newDocumentOptions (the v6 mechanism; the old
  // __experimental_actions field was removed in Sanity v6).
  fields: [
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      of: [
        defineArrayMember({
          name: "section",
          title: "Section",
          type: "object",
          fields: [
            defineField({
              name: "sectionTitle",
              title: "Section title",
              type: "string",
              description: 'e.g. "Experience", "Education", "Awards"',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "items",
              title: "Items",
              type: "array",
              of: [
                defineArrayMember({
                  name: "item",
                  title: "Item",
                  type: "object",
                  fields: [
                    defineField({
                      name: "year",
                      title: "Year",
                      type: "string",
                      description: 'e.g. "2024" or "2022 — now"',
                    }),
                    defineField({
                      name: "title",
                      title: "Title",
                      type: "string",
                      description: 'e.g. "Technical PM"',
                    }),
                    defineField({
                      name: "detail",
                      title: "Detail",
                      type: "string",
                      description: 'e.g. "MoFlo · AI marketing SaaS"',
                    }),
                  ],
                  preview: {
                    select: { title: "title", subtitle: "year" },
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: { title: "sectionTitle" },
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Resume" }),
  },
});
