import { FieldMeta } from "../api/types/types";

const errorToStringWithoutBraces = (
  obj: Record<string, string>,
  metaMap: Record<FieldMeta["key"], FieldMeta>,
) => {
  return Object.entries(obj)
    .map(([key, value]) => `${metaMap[key]?.name || key}: ${value}`)
    .join("; ");
};

export { errorToStringWithoutBraces };
