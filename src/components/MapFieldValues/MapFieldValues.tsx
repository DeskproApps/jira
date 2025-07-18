import { ADFEntity } from "@atlaskit/adf-utils";
import {
  ExternalIconLink,
  Property,
  PropertyRow,
  useDeskproLatestAppContext,
} from "@deskpro/app-sdk";
import { H2, Stack } from "@deskpro/deskpro-ui";
import { parseJiraDescription } from "../../hooks/hooks";
import { isNil } from "../../utils";
import { format } from "../../utils/date";
import { FieldMeta, SearchIssueItem, IssueItem } from "../../api/types/types";
import { DeskproTickets } from "../DeskproTickets";
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
  ParentFieldValue,
} from "../../api/types/fieldsValue";
import { TicketData, Settings, FieldType, DateTime } from "../../types";

export const MapFieldValues = ({
  issue,
  usableFields,
}: {
  issue: SearchIssueItem | IssueItem;
  usableFields: FieldMeta[];
}) => {
  const { context } = useDeskproLatestAppContext<TicketData, Settings>();
  const domain = context?.settings?.domain;
  const parentFieldValue = (issue.parent as ParentFieldValue)?.key
  const projectFieldValue = (issue.project as Project)

  return (
    <Stack vertical style={{ width: "100%" }}>
      <PropertyRow>
        <Property label="Issue Key" text={issue.key} />
        <Property label="Deskpro Tickets" text={<DeskproTickets issue={issue} />} />
      </PropertyRow>

      {projectFieldValue && (
        <Property key={projectFieldValue?.key} label={"Project"} text={
          <Stack style={{ alignItems: "center" }} gap={5}>
            <H2>{projectFieldValue?.name}</H2>
            <ExternalIconLink
              href={`https://${domain}.atlassian.net/browse/${projectFieldValue?.key}`}
            />
          </Stack>
        } />
      )}

      {parentFieldValue && (
        <Property key={parentFieldValue} label={"Parent Task"} text={
          <Stack style={{ alignItems: "center" }} gap={5}>
            <H2>{parentFieldValue}</H2>
            <ExternalIconLink
              href={`https://${domain}.atlassian.net/browse/${parentFieldValue}`}
            />
          </Stack>} />
      )}

      {usableFields.map((field) => {
        const excludedKeys = ["key", "linkedCount", "parent", "project"]

        if (excludedKeys.includes(field.key)) {
          return
        }

        const fieldValue = issue[field.key];
        let content;

        if (isNil(fieldValue)) {
          return <Property label={field.name} text={"-"} />;
        }

        if (field.name === "Parent") {
          content = (
            <Stack style={{ alignItems: "center" }} gap={5}>
              <H2>{(fieldValue as ParentFieldValue)?.key}</H2>
              <ExternalIconLink
                href={`https://${domain}.atlassian.net/browse/${(fieldValue as ParentFieldValue).key}`}
              />
            </Stack>
          );

          return <Property key={field.key} label={field.name} text={<>{content}</>} />;
        }

        switch (field.schema?.type) {
          case "progress":
            content = <H2>{(fieldValue as Progress).progress}</H2>;
            break;

          case "votes":
            content = <H2>{(fieldValue as Votes).votes}</H2>;
            break;

          case "date":
          case "datetime":
            content = <H2>{format(fieldValue as DateTime, { time: field.schema?.type === "datetime" })}</H2>;
            break;

          case "issuetype":
            content = <H2>{(fieldValue as Issuetype)?.name}</H2>;

            break;

          case "number":
            content = <H2>{fieldValue as number}</H2>;

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
              break;
            }

            if (
              field.schema.items === "component"
              || field.schema.items === "version"
              || field.schema.items === "group"
            ) {
              content = <H2>{(fieldValue as Components[]).map((e) => e.name).join(", ")}</H2>;
            } else if (field.schema.items === "option") {
              content = <H2>{(fieldValue as Option[]).map((e) => e.value).join(", ")}</H2>;
            } else if (field.schema.items === "issuelinks") {
              content = (
                <div>
                  {(fieldValue as IssueLink[]).map((value) => (
                    <Stack style={{ alignItems: "center" }} gap={5}>
                      <H2>{value?.inwardIssue?.key}</H2>
                      <ExternalIconLink href={`https://${domain}.atlassian.net/browse/${value?.inwardIssue?.key}`} />
                    </Stack>
                  ))}
                </div>
              );
            } else if (field.schema.items === "user") {
              content = (
                <>
                  {(fieldValue as UserBean[] ?? []).map((u) => (
                    <Stack style={{ alignItems: "center" }} gap={5}>
                      <img
                        src={u.avatarUrls["16x16"]}
                        className="comment-list-item-avatar"
                        width="16"
                        alt={u?.displayName}
                      />
                      <H2>{u?.displayName}</H2>
                      <ExternalIconLink href={`https://${domain}.atlassian.net/jira/people/${u.accountId}`} />
                    </Stack>
                  ))}
                </>
              );
              break;
            } else {
              content = <H2>{(fieldValue as []).join(", ")}</H2>;
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
          case "group":
          case "version":
            content = <H2>{(fieldValue as Status).name || fieldValue as string}</H2>;
            break;

          case "option":
          case "option-with-child":
            content = <H2>{(fieldValue as Option).value}</H2>;
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
              content = (
                <Stack gap={2} wrap="wrap" style={{ wordBreak: "break-all" }}>
                  {parseJiraDescription(fieldValue as ADFEntity)}
                </Stack>
              );
              break;
            }
            // Fallback rendering for unhandled [basic] field types
            content = <H2>{typeof fieldValue === "string" || typeof fieldValue === "number"
              ? fieldValue
              : "-"}</H2>;
        }

        return <Property key={field.key} label={field.name} text={<>{content}</>} />;
      })}
    </Stack>
  );
};
