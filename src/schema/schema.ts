import { z, ZodTypeAny } from "zod";
import { FieldType } from "../types";
import { FieldMeta } from "../api/types/types";

const baseSchema = z.object({
  project: z.object({
    id: z.string(),
  }),
  issuetype: z.object({
    id: z.string(),
  }),
}).catchall(z.any());

export type JiraIssueSchema = z.infer<typeof baseSchema>;

export const getSchema = (usableFields: FieldMeta[]) => {
  const objects = usableFields.reduce<Record<string, ZodTypeAny>>((acc, curr) => {
    switch (curr.schema?.type) {
      case "string":
        if (curr.schema?.custom === FieldType.URL) {
          return { ...acc, [curr.key]: z.string().url() };
        }
        return { ...acc, [curr.key]: z.string() };
      case "number":
        return { ...acc, [curr.key]: z.number() };
      case "date":
      case "datetime":
        return { ...acc, [curr.key]: z.date() };
      case "issuelink":
      case "priority":
      case "user":
      case "version":
      case "select":
      case "option":
        return {
          ...acc,
          [curr.key]: z.object({ id: z.coerce.string() }),
        };
      case "array":
        return { ...acc, [curr.key]: z.array(z.any()) };
      default:
        return { ...acc, [curr.key]: z.unknown() };
    }
  }, {});

  //add optional if not required
  Object.keys(objects).forEach((key) => {
    if (!usableFields.find((e) => e.key === key)?.required) {
      objects[key] = objects[key].optional();
    }
  });

  return baseSchema.extend(objects);
};
