import {
  ExternalIconLink,
  Property,
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

  return (
    <Stack vertical>
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
              <Stack style={{ alignItems: "center" }}>
                <H2>{usedField?.name}</H2>
                <ExternalIconLink
                  href={`https://${domain}.atlassian.net/browse/${usedField.key}`}
                />
              </Stack>
            );

            break;

          case "user":
            content = (
              <Stack style={{ alignItems: "center" }}>
                <H2>{usedField?.displayName}</H2>
                <ExternalIconLink
                  href={`https://${domain}.atlassian.net/jira/people/${usedField.accountId}`}
                />
              </Stack>
            );

            break;

          case "watches":
            content = (
              <Stack style={{ alignItems: "center" }}>
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
            } else {
              content = <H2>{usedField.join(",")}</H2>;
            }

            break;
          case "priority":
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
            content = <H2>{usedField?.toString()}</H2>;
        }

        return <Property label={field.name} text={<>{content}</>} />;
      })}
    </Stack>
  );
};
