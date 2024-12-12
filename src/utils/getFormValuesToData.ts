import { match, P } from "ts-pattern";
import { formatISO } from "date-fns";
import { paragraphDoc } from "../api/adf";
import { FieldType } from "../types";
import { IssueFormData, FieldMeta } from "../api/types/types";
import { Option, Components } from "../api/types/fieldsValue";

const getFormValuesToData = (
  values: IssueFormData,
  metaMap: Record<FieldMeta["key"], FieldMeta>,
): IssueFormData => {
  return Object.keys(values).reduce((acc, fieldKey) => {
    const value = values[fieldKey];
    const meta: FieldMeta|undefined = metaMap[fieldKey];

    const formatedValue = (fieldKey === "description")
      ? paragraphDoc(value as string)
      : (fieldKey === "project" || fieldKey === "issuetype")
      ? value
      : match(meta?.schema)
        .with({ type: "date" }, () => formatISO(value as Date, { representation: "date" }))
        .with({ type: "datetime" }, () => formatISO(value as Date))
        .with({ type: "group" }, () => ({ name: (value as Option).id }))
        .with({ type: "array", items: "version" }, () => (value as Option[] ?? []).map(({ id }) => ({ id })))
        .with({ type: "array", items: "user" }, () => (value as Option[] ?? []).map((id) => ({ id })))
        .with({ type: "array", items: "option" }, () => (value as Option[] ?? []).map(({ id }) => ({ id })))
        .with({ type: "array", items: "group" }, () => (value as Components[] ?? []).map((name) => ({ name })))
        .with({ type: "string", custom: FieldType.TEXT_PARAGRAPH }, () => paragraphDoc(value as string))
        .with(P.union(
          { type: "option" },
          { type: "option-with-child" },
        ), () => ({ id: (value as Option).id }))
        .with(P.union(
          { type: "string" },
          { type: "version" },
          { type: "number" },
          { type: "project" },
          { type: "option" },
          { type: "user" },
        ), () => value)
        .otherwise(() => value);

    if (formatedValue) {
      (acc as IssueFormData)[fieldKey]  = formatedValue;
    }

    return acc;
  }, {});
};

export { getFormValuesToData };
