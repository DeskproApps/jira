import { FieldType } from "@/types";
import { FieldMeta, IssueBean, TransfornedFieldMeta } from "./types/types";

export function findEpicLinkMeta(issue: IssueBean): FieldMeta | null {
  return Object.values(issue?.editmeta?.fields ?? {}).filter((field) => {
    return field.schema.custom === FieldType.EPIC;
  })[0] ?? null;
};

export function transformFieldMeta(field: FieldMeta): TransfornedFieldMeta {
  return {
    ...field,
    type: field.schema?.custom as FieldType,
  };
};

export function isCustomFieldKey(key: string): boolean {
  return /^customfield_[0-9]+$/.test(key);
}


