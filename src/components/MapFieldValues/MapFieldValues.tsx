/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  ExternalIconLink,
  Property,
  PropertyRow,
  useDeskproLatestAppContext,
} from "@deskpro/app-sdk";
import { H2, Stack } from "@deskpro/deskpro-ui";
import { parseJiraDescription } from "../../hooks/hooks";
import { Field } from "../../api/types/types";

export const MapFieldValues = ({
  issue,
  usableFields,
}: {
  issue: any;
  usableFields: Field[];
}) => {
  const { context } = useDeskproLatestAppContext();
  const domain = context?.settings.domain;

  const haslinkedAndIssueKey = Boolean(!isNaN(issue.linkedCount) && issue.key);

  return (
    <Stack vertical style={{ width: "100%" }}>
      {haslinkedAndIssueKey && (
        <PropertyRow>
          <Property label="Issue Key" text={issue.key} />
          <Property label="Deskpro Tickets" text={issue.linkedCount} />
        </PropertyRow>
      )}
      {usableFields.map((field) => {
        const usedField = issue[field.key];

        let content;

        if (usedField === null || usedField === undefined) {
          return <Property label={field.name} text={"-"} />;
        }

        switch (field.schema?.type) {
          case "progress":
            content = <H2>{usedField.progress}</H2>;

            break;
          case "votes":
            content = <H2>{usedField.votes}</H2>;

            break;

          case "datetime":
          case "date":
            content = <H2>{new Date(usedField).toDateString()}</H2>;

            break;

          case "issuetype":
            content = <H2>{usedField?.description}</H2>;

            break;

          case "number":
            content = <H2>{usedField}</H2>;

            break;
          case "project":
            content = (
              <Stack style={{ alignItems: "center" }} gap={5}>
                <H2>{usedField?.name}</H2>
                <ExternalIconLink
                  href={`https://${domain}.atlassian.net/browse/${usedField.key}`}
                />
              </Stack>
            );

            break;

          case "user":
            content = (
              <Stack style={{ alignItems: "center" }} gap={5}>
                <img
                  src={usedField.avatarUrls["16x16"]}
                  className="comment-list-item-avatar"
                  width="16"
                  alt={usedField?.displayName}
                />
                <H2>{usedField?.displayName}</H2>
                <ExternalIconLink
                  href={`https://${domain}.atlassian.net/jira/people/${usedField.accountId}`}
                />
              </Stack>
            );

            break;

          case "watches":
            content = (
              <Stack style={{ alignItems: "center" }} gap={5}>
                <H2>{usedField?.watchCount}</H2>
                <ExternalIconLink href={issue.watchCount} />
              </Stack>
            );

            break;
          case "array":
            if (usedField.length === 0) {
              content = <H2>-</H2>;
            } else if (
              field.schema.custom ===
              "com.atlassian.jira.plugin.system.customfieldtypes:multicheckboxes"
            ) {
              content = <H2>{usedField.map((e: any) => e.value).join(",")}</H2>;
            } else if (
              field.schema.items === "component" ||
              field.schema.items === "version"
            ) {
              content = <H2>{usedField.map((e: any) => e.name).join(",")}</H2>;
            } else if (field.schema.items === "option") {
              content = <H2>{usedField.map((e: any) => e.value).join(",")}</H2>;
            } else if (field.schema.items === "issuelinks") {
              content = <div>
                {(usedField?.length === 0)
                  ? "-"
                  : usedField.map((value: { inwardIssue: { key?: string } }) => (
                    <Stack style={{ alignItems: "center" }} gap={5}>
                      <H2>{value?.inwardIssue?.key}</H2>
                      <ExternalIconLink href={`https://${domain}.atlassian.net/browse/${value?.inwardIssue?.key}`} />
                    </Stack>
                  ))
                }
              </div>;
            } else {
              content = <H2>{usedField.join(",")}</H2>;
            }

            break;
          case "priority":
            content = (
              <Stack align="center" gap={5}>
                <img src={usedField.iconUrl} width={16} alt={usedField?.name} />
                <H2 style={{ marginTop: "2px" }}>
                  {usedField.name || usedField}
                </H2>
              </Stack>
            );

            break;
          case "status":
            content = <H2>{usedField.name || usedField}</H2>;

            break;

          case "option":
            if (
              field.schema.custom ===
              "com.atlassian.jira.plugin.system.customfieldtypes:select"
            ) {
              content = <H2>{usedField.value}</H2>;
            }

            break;
          // eslint-disable-next-line no-fallthrough
          case "sd-feedback":
          case "resolution":
          case "string":
          default:
            if (field.schema?.system === "description") {
              content = (
                <Stack gap={2} wrap="wrap" style={{ wordBreak: "break-all" }}>
                  {parseJiraDescription(issue.description)}
                </Stack>
              );

              break;
            }
            if (field.schema?.custom === "com.atlassian.jira.plugin.system.customfieldtypes:textarea") {
              const value = issue[field.key];
              content = (
                <Stack gap={2} wrap="wrap" style={{ wordBreak: "break-all" }}>
                  {parseJiraDescription(value)}
                </Stack>
              );
              break;
            }

            //@ts-ignore
            if (haslinkedAndIssueKey && field.key === "key") return;
            //@ts-ignore
            if (haslinkedAndIssueKey && field.key === "linkedCount") return;
            content = <H2>{usedField?.toString()}</H2>;
        }

        return <Property label={field.name} text={<>{content}</>} />;
      })}
    </Stack>
  );
};
