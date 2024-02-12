//@ts-nocheck
import { ExternalIconLink, Property } from "@deskpro/app-sdk";
import { H2, Stack } from "@deskpro/deskpro-ui";
import { Field } from "../../context/StoreProvider/types/types";
import { DateField } from "../IssueFieldView/CustomField/DateField";
import { DateTimeField } from "../IssueFieldView/CustomField/DateTimeField";
import { parseJiraDescription } from "../../hooks";

export const FieldMapping = ({
  issue,
  usableFields,
}: {
  issue: any;
  usableFields: Field[];
}) => {
  return (
    <Stack vertical gap={5}>
      {usableFields.map((field) => {
        const usedField = issue[field.key];
        if (!usedField)
          return (
            <Property title={field.name}>
              <H2>-</H2>
            </Property>
          );

        switch (field.schema?.type) {
          case "progress":
            return (
              <Property title={field.name}>
                <H2>{usedField.progress}</H2>
              </Property>
            );
          case "votes":
            return (
              <Property title={field.name}>
                <H2>{usedField.votes}</H2>
              </Property>
            );

          case "date":
            return (
              <Property title={field.name}>
                <DateField meta={{}} key={field.id} value={usedField} />
              </Property>
            );
          case "datetime":
            return (
              <Property title={field.name}>
                <DateTimeField meta={{}} key={field.id} value={usedField} />{" "}
              </Property>
            );

          case "issuetype":
            return (
              <Property title={field.name}>
                <H2>{usedField?.description}</H2>
              </Property>
            );

          case "number":
            return (
              <Property title={field.name}>
                <H2>{usedField}</H2>
              </Property>
            );

          case "project":
            return (
              <Property title={field.name}>
                <Stack style={{ alignItems: "center" }}>
                  <H2>{usedField?.name}</H2>
                  <ExternalIconLink href={issue.self} />
                </Stack>
              </Property>
            );

          case "user":
            return (
              <Property title={field.name}>
                <Stack style={{ alignItems: "center" }}>
                  <H2>{usedField?.displayName}</H2>
                  <ExternalIconLink href={issue.self} />
                </Stack>
              </Property>
            );

          case "watches":
            return (
              <Property title={field.name}>
                <Stack style={{ alignItems: "center" }}>
                  <H2>{usedField?.watchCount}</H2>
                  <ExternalIconLink href={issue.watchCount} />
                </Stack>
              </Property>
            );
          case "array":
            if (usedField.length === 0) return <H2>-</H2>;

            if (
              field.schema.custom ===
              "com.atlassian.jira.plugin.system.customfieldtypes:multicheckboxes"
            ) {
              return (
                <Property title={field.name}>
                  <H2>{usedField.map((e) => e.value).join(",")}</H2>
                </Property>
              );
            }

            return (
              <Property title={field.name}>
                <H2>{usedField.join(",")}</H2>
              </Property>
            );
          case "priority":
          case "status":
            return (
              <Property title={field.name}>
                <H2>{usedField.name || usedField}</H2>
              </Property>
            );

          case "option":
            if (
              field.schema.custom ===
              "com.atlassian.jira.plugin.system.customfieldtypes:select"
            ) {
              return (
                <Property title={field.name}>
                  <H2>{usedField.value}</H2>
                </Property>
              );
            }
          // eslint-disable-next-line no-fallthrough
          case "sd-feedback":
          case "resolution":
          case "string":
          default:
            if (field.schema?.system === "description") {
              return (
                <Property title={field.name}>
                  {parseJiraDescription(issue.description)}
                </Property>
              );
            }
            return (
              <Property title={field.name}>
                <H2>{usedField.toString()}</H2>
              </Property>
            );
        }
      })}
    </Stack>
  );
};
