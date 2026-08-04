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
            // Now entries — newest first, since the newest one is the live /now.
            S.listItem()
              .title("Now entries")
              .id("nowEntry")
              .child(
                S.documentTypeList("nowEntry")
                  .title("Now entries")
                  .defaultOrdering([
                    { field: "effectiveFrom", direction: "desc" },
                  ]),
              ),
            S.divider(),
            // Everything else as normal lists.
            ...S.documentTypeListItems().filter(
              (item) => !["resume", "nowEntry"].includes(item.getId() ?? ""),
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
