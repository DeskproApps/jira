import { ADFEntity } from "@atlaskit/adf-utils";
import {
  ExternalIconLink,
  Property,
  PropertyRow,
  useDeskproLatestAppContext,
} from "@deskpro/app-sdk";
import { H2, Stack } from "@deskpro/deskpro-ui";
import { parseJiraDescription } from "../../hooks/hooks";
import { isNil } from "../../utils/utils";
import { FieldMeta, SearchIssueItem, IssueItem } from "../../api/types/types";
import {
  Progress,
  Votes,
  Option,
  Status,
  Watches,
  Project,
  UserBean,
  Priority,
  Issuetype,
  IssueLink,
  Components,
} from "../../api/types/fieldsValue";
import { TicketData, Settings, FieldType, DateTime } from "../../types";

export const MapFieldValues = ({
  issue,
  usableFields,
}: {
  issue: SearchIssueItem|IssueItem;
  usableFields: FieldMeta[];
}) => {
  const { context } = useDeskproLatestAppContext<TicketData, Settings>();
  const domain = context?.settings?.domain;

  const haslinkedAndIssueKey = Boolean(!isNaN(Number(issue.linkedCount)) && issue.key);

  return (
    <Stack vertical style={{ width: "100%" }}>
      {haslinkedAndIssueKey && (
        <PropertyRow>
          <Property label="Issue Key" text={issue.key} />
          <Property label="Deskpro Tickets" text={issue.linkedCount} />
        </PropertyRow>
      )}
      {usableFields.map((field) => {
        const fieldValue = issue[field.key];

        let content;

        if (isNil(fieldValue)) {
          return <Property label={field.name} text={"-"} />;
        }

        switch (field.schema?.type) {
          case "progress":
            content = <H2>{(fieldValue as Progress).progress}</H2>;

            break;
          case "votes":
            content = <H2>{(fieldValue as Votes).votes}</H2>;

            break;

          case "datetime":
          case "date":
            content = <H2>{new Date(fieldValue as DateTime).toDateString()}</H2>;

            break;

          case "issuetype":
            content = <H2>{(fieldValue as Issuetype)?.description}</H2>;

            break;

          case "number":
            content = <H2>{fieldValue as number}</H2>;

            break;
          case "project":
            content = (
              <Stack style={{ alignItems: "center" }} gap={5}>
                <H2>{(fieldValue as Project)?.name}</H2>
                <ExternalIconLink
                  href={`https://${domain}.atlassian.net/browse/${(fieldValue as Project).key}`}
                />
              </Stack>
            );

            break;

          case "user":
            content = (
              <Stack style={{ alignItems: "center" }} gap={5}>
                <img
                  src={(fieldValue as UserBean).avatarUrls["16x16"]}
                  className="comment-list-item-avatar"
                  width="16"
                  alt={(fieldValue as UserBean)?.displayName}
                />
                <H2>{(fieldValue as UserBean)?.displayName}</H2>
                <ExternalIconLink
                  href={`https://${domain}.atlassian.net/jira/people/${(fieldValue as UserBean).accountId}`}
                />
              </Stack>
            );

            break;

          case "watches":
            content = (
              <Stack style={{ alignItems: "center" }} gap={5}>
                <H2>{(fieldValue as Watches)?.watchCount}</H2>
                <ExternalIconLink href={String(issue.watchCount)} />
              </Stack>
            );

            break;
          case "array":
            if ((fieldValue as []).length === 0) {
              content = <H2>-</H2>;
            } else if (field.schema.custom === FieldType.CHECKBOXES) {
              content = <H2>{(fieldValue as { value: string }[]).map((e) => e.value).join(",")}</H2>;
            } else if (
              field.schema.items === "component" ||
              field.schema.items === "version"
            ) {
              content = <H2>{(fieldValue as Components[]).map((e) => e.name).join(",")}</H2>;
            } else if (field.schema.items === "option") {
              content = <H2>{(fieldValue as Option[]).map((e) => e.value).join(",")}</H2>;
            } else if (field.schema.items === "issuelinks") {
              content = <div>
                {((fieldValue as [])?.length === 0)
                  ? "-"
                  : (fieldValue as IssueLink[]).map((value) => (
                    <Stack style={{ alignItems: "center" }} gap={5}>
                      <H2>{value?.inwardIssue?.key}</H2>
                      <ExternalIconLink href={`https://${domain}.atlassian.net/browse/${value?.inwardIssue?.key}`} />
                    </Stack>
                  ))
                }
              </div>;
            } else {
              content = <H2>{(fieldValue as []).join(",")}</H2>;
            }

            break;
          case "priority":
            content = (
              <Stack align="center" gap={5}>
                <img src={(fieldValue as Priority).iconUrl} width={16} alt={(fieldValue as Priority)?.name} />
                <H2 style={{ marginTop: "2px" }}>
                  {(fieldValue as Priority).name || fieldValue as string}
                </H2>
              </Stack>
            );

            break;
          case "status":
            content = <H2>{(fieldValue as Status).name || fieldValue as string}</H2>;

            break;

          case "option":
            if (field.schema.custom === FieldType.SELECT_SINGLE) {
              content = <H2>{(fieldValue as Option).value}</H2>;
            }

            break;
          case "sd-feedback":
          case "resolution":
          case "string":
          default:
            if (field.schema?.system === "description") {
              content = (
                <Stack gap={2} wrap="wrap" style={{ wordBreak: "break-all" }}>
                  {parseJiraDescription(issue.description as ADFEntity)}
                </Stack>
              );

              break;
            }
            if (field.schema?.custom === FieldType.TEXT_PARAGRAPH) {
              const value = issue[field.key];
              content = (
                <Stack gap={2} wrap="wrap" style={{ wordBreak: "break-all" }}>
                  {parseJiraDescription(value as ADFEntity)}
                </Stack>
              );
              break;
            }

            if (haslinkedAndIssueKey && field.key === "key") return;

            if (haslinkedAndIssueKey && field.key === "linkedCount") return;

            content = <H2>{fieldValue?.toString()}</H2>;
        }

        return <Property key={field.key} label={field.name} text={<>{content}</>} />;
      })}
    </Stack>
  );
};
