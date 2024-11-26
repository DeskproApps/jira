import { getFormValuesToData } from "../getFormValuesToData";
import data from "./mockData";
import formValues from "./mockFormValues";
import metaMap from "./mockMetaMap";
import { FieldMeta, IssueFormData } from "../../api/types/types";

describe("utils", () => {
  describe("getFormValuesToData", () => {
    test("should return values for create/update issue", () => {
      expect(getFormValuesToData(
        formValues as unknown as IssueFormData,
        metaMap as Record<FieldMeta["key"], FieldMeta>
      )).toMatchObject(data);
    });
  });
});
