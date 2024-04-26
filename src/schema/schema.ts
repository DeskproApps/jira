import { z } from "zod";

export const getSchema = (usableFields: any[]) => {
  const objects = usableFields.reduce((acc, curr) => {
    switch (curr.schema?.type) {
      case "string":
        if (
          curr.schema?.custom ===
          "com.atlassian.jira.plugin.system.customfieldtypes:url"
        ) {
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
        return { ...acc, [curr.key]: z.object({ id: z.string() }) };
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

  const schema = z.object({
    project: z.object({
      id: z.string(),
    }),
    issuetype: z.object({
      id: z.string(),
    }),
    ...objects,
  });

  return schema;
};
