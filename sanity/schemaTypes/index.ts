import type { SchemaTypeDefinition } from "sanity";
import { post } from "./post";
import { resume } from "./resume";

export const schemaTypes: SchemaTypeDefinition[] = [post, resume];

export { post, resume };
