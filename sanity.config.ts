import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { apiVersion, dataset, projectId } from "./sanity/env";
import { schemaTypes } from "./sanity/schemaTypes";

const RESUME_DOC_ID = "resume";

export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            // Singleton resume — links straight to the one document.
            S.listItem()
              .title("Resume")
              .id("resume")
              .child(
                S.document()
                  .schemaType("resume")
                  .documentId(RESUME_DOC_ID),
              ),
            S.divider(),
            // Everything else as normal lists.
            ...S.documentTypeListItems().filter(
              (item) => item.getId() !== "resume",
            ),
          ]),
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
  document: {
    // Singleton: strip create/delete/duplicate actions on the resume document.
    actions: (prev, context) =>
      context.schemaType === "resume"
        ? prev.filter(
            ({ action }) =>
              action && ["update", "publish", "discardChanges"].includes(action),
          )
        : prev,
  },
  // Hide the resume type from the global "create new document" menu.
  schema: {
    types: schemaTypes,
    templates: (templates) =>
      templates.filter(({ schemaType }) => schemaType !== "resume"),
  },
});
