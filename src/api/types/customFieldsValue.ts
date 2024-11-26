import { ADFEntity } from "@atlaskit/adf-utils";
import { DateTime } from "../../types";
import { FieldMeta } from "./types";

export type SprintValue = {
  boardId: number;
  endDate: DateTime;
  goal: string;
  id: number;
  name: string;
  startDate: DateTime;
  state: string; // "active"
};

export type CustomFieldValue =
  | string
  | number
  | boolean
  | SprintValue
  | ADFEntity
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  | unknown
;

export type CustomFieldsValues = Record<FieldMeta["key"], CustomFieldValue>;
