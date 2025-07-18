import jiraRequest from "@/api/jiraRequest";
import { CustomFieldsValues, CustomFieldValue, SprintValue } from "@/api/types/customFieldsValue";
import { FieldMeta, FieldsValues, IssueBean, IssueItem, SearchIssues, TransfornedFieldMeta } from "@/api/types/types";
import { findEpicLinkMeta, isCustomFieldKey, transformFieldMeta } from "@/api/utils";
import { FieldType } from "@/types";
import { IDeskproClient } from "@deskpro/app-sdk";

export default async function listLinkedIssues (
  client: IDeskproClient,
  keys: string[],
): Promise<IssueItem[]> {
  if (!keys.length) {
    return [];
  }
  const issueJql = encodeURIComponent(`issueKey IN (${keys.join(",")})`);

  const { issues: fullIssues } = await jiraRequest<SearchIssues>(
    client,
    {endpoint: `/search?jql=${issueJql}&expand=editmeta`},
  )

  const epicKeys: Record<IssueBean["key"], FieldMeta["key"]> = (fullIssues ?? []).reduce((list, issue) => {
    const meta = findEpicLinkMeta(issue) as { key: string } | null;
    if (!meta) {
      return list;
    }

    if (!issue.fields[meta.key]) {
      return list;
    }

    return { ...list, [issue.key]: issue.fields[meta.key] };
  }, {});

  const sprints: Record<IssueBean["key"], FieldMeta["key"]> = (fullIssues ?? []).reduce((list, issue) => {
    const meta = findSprintLinkMeta(issue);
    if (!meta) {
      return list;
    }

    if (!issue.fields[meta.key]) {
      return list;
    }

    return { ...list, [issue.key]: issue.fields[meta.key] };
  }, {});

  let epics: Record<IssueBean["key"], IssueBean> = {};

  if (Object.values(epicKeys).length) {
    const epicJql = encodeURIComponent(
      `issueKey IN (${Object.values(epicKeys).join(",")})`,
    );
    const { issues: fullEpics } = await jiraRequest<SearchIssues>(
      client,
     {endpoint: `/search?jql=${epicJql}`}
    );

    epics = (fullEpics ?? []).reduce((list, issue) => ({
      ...list,
      [issue.key]: issue,
    }), {});
  }

  return (fullIssues ?? []).map((issue) => {
    const epic = epics[epicKeys[issue.key]];
    const issueSprints = ((sprints[issue.key] || []) as SprintValue[]).map((sprint) => ({
      sprintBoardId: sprint.boardId,
      sprintName: sprint.name,
      sprintState: sprint.state,
    }));

    return {
      ...issue.fields,
      id: issue.id,
      key: issue.key,
      epicKey: epic?.key,
      epicName: epic?.fields.summary,
      status: issue.fields.status?.name || "-",
      sprints: issueSprints,
      customFields: combineCustomFieldValueAndMeta(
        extractCustomFieldValues(issue.fields),
        buildCustomFieldMeta(issue.editmeta.fields),
      ),
    };
  });
};


function findSprintLinkMeta(issue: IssueBean): FieldMeta | null {
  return Object.values(issue?.editmeta?.fields ?? {}).filter((field) => {
    return field.schema.custom === FieldType.SPRINT;
  })[0] ?? null;
}

function combineCustomFieldValueAndMeta(
  values: CustomFieldsValues,
  meta: Record<FieldMeta["key"], TransfornedFieldMeta | FieldMeta>,
): Record<FieldMeta["key"], { value: CustomFieldValue, meta: FieldMeta }> {
  return Object.keys(meta).reduce((fields, key) => ({
    ...fields,
    [key]: {
      value: values[key],
      meta: meta[key],
    },
  }), {});
}

function extractCustomFieldValues(
  fields: FieldsValues,
): CustomFieldsValues {
  return Object.keys(fields).reduce((customFields, key) => {
    if (!isCustomFieldKey(key)) {
      return customFields;
    }

    return { ...customFields, [key]: fields[key] };
  }, {});
};

export function buildCustomFieldMeta(fields: IssueBean["editmeta"]["fields"]): Record<FieldMeta["key"], TransfornedFieldMeta | FieldMeta> {
  const customFields = extractCustomFieldMeta(fields);

  return Object.keys(customFields).reduce((fields, key) => {
    return {
      ...fields,
      [key]: transformFieldMeta(customFields[key]),
    };
  }, {});
}


function extractCustomFieldMeta(
  fields: IssueBean["editmeta"]["fields"],
): IssueBean["editmeta"]["fields"] {
  return Object.keys(fields).reduce((customFields, key) => {
    if (!isCustomFieldKey(key)) {
      return customFields;
    }

    return { ...customFields, [key]: fields[key] };
  }, {});
}