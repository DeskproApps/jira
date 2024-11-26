import { ADFEntity } from "@atlaskit/adf-utils";
import { FieldMeta, IssueBean } from "../api/types/types";
import { useAdfToPlainText } from "../hooks/hooks";
import { FieldType, DateTime } from "../types";
import { JiraIssueSchema } from "../schema/schema";
import { UserBean } from "../api/types/fieldsValue";

const jiraIssueToFormValues = (
  issue: IssueBean["fields"],
  usableFields: FieldMeta[],
) => {
  const values = Object.keys(issue).reduce<Partial<JiraIssueSchema>>((acc, key) => {
    const usableField = usableFields.find((e) => e.key === key)

    if (!usableField) {
      return acc;
    }

    switch (usableField?.schema?.type) {
      case "user": {
        acc[key] = {
          id: (issue[key] as UserBean)?.accountId,
        };

        break;
      }

      case "date":
      case "datetime": {
        if (!issue[key]) break;
        acc[key] = new Date(issue[key] as DateTime);

        break;
      }

      case "string": {
        if (usableField.schema.system === "description" || usableField.schema.custom === FieldType.TEXT_PARAGRAPH) {
          acc[key] = useAdfToPlainText(issue[key] as ADFEntity);

          break;
        }
      }
      // eslint-disable-next-line no-fallthrough
      default:
        acc[key] = issue[key];
    }

    return acc;
  }, {});

  return values;
};

export { jiraIssueToFormValues };
