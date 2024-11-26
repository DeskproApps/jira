import { isPrimitive } from "./isPrimitive";
import { Settings } from "../types";
import { IssueItem } from "../api/types/types";

const substitutePlaceholders = (
  string: string,
  obj: Pick<Settings, "domain"|"username"|"api_key"> & Partial<IssueItem>,
): string => {
  if (!obj) return string;

  for (const [key, value] of Object.entries(obj)) {
    if (isPrimitive(value)) {
      string = string.replace(`__${key}__`, String(value));
    }
  }
  return string;
};

export { substitutePlaceholders };
