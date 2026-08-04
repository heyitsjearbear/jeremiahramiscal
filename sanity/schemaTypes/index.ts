import type { SchemaTypeDefinition } from "sanity";
import { post } from "./post";
import { resume } from "./resume";
import { nowEntry } from "./nowEntry";

export const schemaTypes: SchemaTypeDefinition[] = [post, resume, nowEntry];

export { post, resume, nowEntry };
