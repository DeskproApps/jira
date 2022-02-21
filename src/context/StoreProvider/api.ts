import {IDeskproClient, proxyFetch} from "@deskpro/app-sdk";
import {
  ApiRequestMethod,
  CreateIssueData,
  InvalidRequestResponseError,
  IssueAttachment,
  IssueItem,
  IssueSearchItem
} from "./types";
import {backlinkCommentDoc, paragraphDoc, removeBacklinkCommentDoc} from "./adf";
import cache from "js-cache";
import {omit} from "lodash";
import {FieldType, IssueMeta} from "../../types";
import {match} from "ts-pattern";

// JIRA REST API Base URL
const API_BASE_URL = "https://__username__:__api_key__@__domain__.atlassian.net/rest/api/3";

// Key for search dependency caching (milliseconds)
const SEARCH_DEPS_CACHE_TTL = 5 * (60 * 1000); // 5 Minutes

/**
 * Fetch a single JIRA issue by key, e.g. "DP-1"
 */
export const getIssueByKey = async (client: IDeskproClient, key: string) =>
  request(client, "GET", `${API_BASE_URL}/issue/${key}`)
;

/**
 * Add "linked" comment to JIRA issue
 */
export const addLinkCommentToIssue = async (client: IDeskproClient, key: string, ticketId: string, url: string) =>
    request(client, "POST", `${API_BASE_URL}/issue/${key}/comment`, {
      body: backlinkCommentDoc(ticketId, url),
    })
;

/**
 * Add "unlinked" comment to JIRA issue
 */
export const addUnlinkCommentToIssue = async (client: IDeskproClient, key: string, ticketId: string, url: string) =>
    request(client, "POST", `${API_BASE_URL}/issue/${key}/comment`, {
      body: removeBacklinkCommentDoc(ticketId, url),
    })
;

/**
 * Search JIRA issues
 */
export const searchIssues = async (client: IDeskproClient, q: string): Promise<IssueSearchItem[]> => {
  const { sections } = await request(client, "GET", `${API_BASE_URL}/issue/picker?query=${q}&currentJQL=`);
  const { issues: searchIssues } = sections.filter((s: { id: string }) => s.id === "cs")[0];
  const keys = (searchIssues ?? []).map((i: { key: string }) => i.key);

  if (!keys.length) {
    return [];
  }

  const issueJql = encodeURIComponent(`issueKey IN (${keys.join(",")})`);
  const { issues: fullIssues } = await request(client, "GET", `${API_BASE_URL}/search?jql=${issueJql}&expand=editmeta`);

  const issues = (fullIssues ?? []).reduce(
    (list: unknown[], issue: { key: string }) => ({ ...list, [issue.key]: issue }),
    {}
  );

  const epicKeys = (fullIssues ?? []).reduce((list: unknown[], issue: any) => {
    const meta = findEpicLinkMeta(issue) as { key: string } | null;
    if (!meta) {
      return list;
    }

    if (!issue.fields[meta.key]) {
      return list;
    }

    return {...list, [issue.key]: issue.fields[meta.key]};
  }, {});

  let epics: { [key: string]: any } = {};

  if (Object.values(epicKeys).length) {
    const epicJql = encodeURIComponent(`issueKey IN (${Object.values(epicKeys).join(",")})`);
    const { issues: fullEpics } = await request(client, "GET", `${API_BASE_URL}/search?jql=${epicJql}`);

    epics = (fullEpics ?? []).reduce(
      (list: unknown[], issue: { key: string }) => ({ ...list, [issue.key]: issue }),
      {}
    );
  }

  return (searchIssues ?? []).map((searchIssue: any) => ({
    id: searchIssue.id,
    key: searchIssue.key,
    keyHtml: searchIssue.keyHtml,
    summary: searchIssue.summaryText,
    summaryHtml: searchIssue.summary,
    status: issues[searchIssue.key].fields.status.name,
    projectKey: issues[searchIssue.key].fields.project.key,
    projectName: issues[searchIssue.key].fields.project.name,
    reporterId: issues[searchIssue.key].fields.reporter.accountId,
    reporterName: issues[searchIssue.key].fields.reporter.displayName,
    reporterAvatarUrl: issues[searchIssue.key].fields.reporter.avatarUrls["24x24"],
    epicKey: epics[epicKeys[searchIssue.key]] ? epics[epicKeys[searchIssue.key]].key : undefined,
    epicName: epics[epicKeys[searchIssue.key]] ? epics[epicKeys[searchIssue.key]].fields.summary : undefined,
  } as IssueSearchItem));
};

/**
 * List linked issues
 */
export const listLinkedIssues = async (client: IDeskproClient, keys: string[]): Promise<IssueItem[]> => {
  if (!keys.length) {
    return [];
  }

  const issueJql = encodeURIComponent(`issueKey IN (${keys.join(",")})`);
  const { issues: fullIssues } = await request(client, "GET", `${API_BASE_URL}/search?jql=${issueJql}&expand=editmeta`);

  const issues = (fullIssues ?? []).reduce(
    (list: unknown[], issue: { key: string }) => ({ ...list, [issue.key]: issue }),
    {}
  );

  const epicKeys = (fullIssues ?? []).reduce((list: unknown[], issue: any) => {
    const meta = findEpicLinkMeta(issue) as { key: string } | null;
    if (!meta) {
      return list;
    }

    if (!issue.fields[meta.key]) {
      return list;
    }

    return {...list, [issue.key]: issue.fields[meta.key]};
  }, {});

  const sprints = (fullIssues ?? []).reduce((list: unknown[], issue: any) => {
    const meta = findSprintLinkMeta(issue) as { key: string } | null;
    if (!meta) {
      return list;
    }

    if (!issue.fields[meta.key]) {
      return list;
    }

    return {...list, [issue.key]: issue.fields[meta.key]};
  }, {});

  let epics: { [key: string]: any } = {};

  if (Object.values(epicKeys).length) {
    const epicJql = encodeURIComponent(`issueKey IN (${Object.values(epicKeys).join(",")})`);
    const { issues: fullEpics } = await request(client, "GET", `${API_BASE_URL}/search?jql=${epicJql}`);

    epics = (fullEpics ?? []).reduce(
      (list: unknown[], issue: { key: string }) => ({ ...list, [issue.key]: issue }),
      {}
    );
  }

  return (fullIssues ?? []).map((issue: any) => ({
    id: issue.id,
    key: issue.key,
    summary: issue.fields.summary,
    status: issues[issue.key].fields.status.name,
    projectKey: issues[issue.key].fields.project.key,
    projectName: issues[issue.key].fields.project.name,
    reporterId: issues[issue.key].fields.reporter.accountId,
    reporterName: issues[issue.key].fields.reporter.displayName,
    reporterAvatarUrl: issues[issue.key].fields.reporter.avatarUrls["24x24"],
    epicKey: epics[epicKeys[issue.key]] ? epics[epicKeys[issue.key]].key : undefined,
    epicName: epics[epicKeys[issue.key]] ? epics[epicKeys[issue.key]].fields.summary : undefined,
    sprints: (sprints[issue.key] ?? []).map((sprint: any) => ({
      sprintBoardId: sprint.boardId,
      sprintName: sprint.name,
      sprintState: sprint.state,
    })),
    description: issues[issue.key].fields.description,
    labels: issues[issue.key].fields.labels ?? [],
    priority: issues[issue.key].fields.priority.name,
    priorityId: issues[issue.key].fields.priority.id,
    priorityIconUrl: issues[issue.key].fields.priority.iconUrl,
    customFields: combineCustomFieldValueAndMeta(
        extractCustomFieldValues(issue.fields),
        buildCustomFieldMeta(issue.editmeta.fields),
    ),
  } as IssueItem));
};

/**
 * Get attachments for a JIRA issue
 */
export const getIssueAttachments = async (client: IDeskproClient, key: string): Promise<IssueAttachment[]> => {
  const res = await request(client, "GET", `${API_BASE_URL}/issue/${key}?fields=attachment`);

  if (!res.fields.attachment) {
    return [];
  }

  return res.fields.attachment.map((attachment: any) => ({
    id: attachment.id,
    filename: attachment.filename,
    sizeBytes: attachment.size,
    sizeMb: attachment.size > 0
      ? (attachment.size / 1042) / 1024
      : 0
    ,
    url: attachment.content,
  } as IssueAttachment));
}

export const createIssue = async (client: IDeskproClient, data: CreateIssueData, meta: Record<string, IssueMeta>) => {
  const customFields = Object.keys(data.customFields).reduce((fields, key) => ({
    ...fields,
    [key]: formatCustomFieldValue(meta[key], data.customFields[key]),
  }), {});

  const body: any = {
    fields: {
      summary: data.summary,
      issuetype: {
        id: data.issueTypeId,
      },
      project: {
        id: data.projectId,
      },
      description: paragraphDoc(data.description),
      reporter: {
        id: data.reporterUserId,
      },
      labels: data.labels,
      priority: {
        id: data.priority,
      },
      ...customFields,
    },
  };

   const res = await request(client, "POST", `${API_BASE_URL}/issue`, body);

   if (!res.id || !res.key) {
     throw new InvalidRequestResponseError("Failed to create JIRA issue", res);
   }

   return res;
};

export const getIssueDependencies = async (client: IDeskproClient) => {
  const cache_key = "data_deps";

  if (!cache.get(cache_key)) {
    const dependencies = [
      request(client, "GET", `${API_BASE_URL}/issue/createmeta?expand=projects.issuetypes.fields`),
      request(client, "GET", `${API_BASE_URL}/project/search?maxResults=999`),
      request(client, "GET", `${API_BASE_URL}/users/search?maxResults=999`),
      request(client, "GET", `${API_BASE_URL}/label?maxResults=999`),
    ];

    const [
      createMeta,
      projects,
      users,
      labels,
    ] = await Promise.all(dependencies);

    const resolved = {
      createMeta,
      projects: projects.values ?? [],
      users,
      labels: labels.values ?? [],
    };

    cache.set(cache_key, resolved, SEARCH_DEPS_CACHE_TTL);
  }

  return cache.get(cache_key);
};

const request = async (client: IDeskproClient, method: ApiRequestMethod, url: string, body?: any) => {
  const dpFetch = await proxyFetch(client);
  const res = await dpFetch(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
  });

  if (res.status === 400) {
    return res.json();
  }

  if (res.status < 200 || res.status >= 400) {
    throw new Error(`${method} ${url}: Response Status [${res.status}]`);
  }

  return res.json();
};

export const buildCustomFieldMeta = (fields: any) => {
  const customFields: Record<string, any> = extractCustomFieldMeta(fields);

  return Object.keys(customFields).reduce((fields, key) => ({
    ...fields,
    [key]: transformFieldMeta(customFields[key]),
  }), {});
};

const findEpicLinkMeta = (issue: any) => Object
  .values(issue.editmeta.fields)
  .filter((field: any) => field.schema.custom === "com.pyxis.greenhopper.jira:gh-epic-link")[0] ?? null
;

const findSprintLinkMeta = (issue: any) => Object
  .values(issue.editmeta.fields)
  .filter((field: any) => field.schema.custom === "com.pyxis.greenhopper.jira:gh-sprint")[0] ?? null
;

const extractCustomFieldMeta = (fields: any) => Object.keys(fields).reduce((customFields, key) => {
  if (!isCustomFieldKey(key)) {
    return customFields;
  }

  return { ...customFields, [key]: fields[key] };
}, {});

const extractCustomFieldValues = (fields: any) => Object.keys(fields).reduce((customFields, key) => {
  if (!isCustomFieldKey(key)) {
    return customFields;
  }

  return { ...customFields, [key]: fields[key] };
}, {});

const transformFieldMeta = (field: any) => ({
  type: field.schema.custom,
  key: field.key,
  name: field.name,
  required: field.required,
  ...omit(field, ["key", "name", "operations", "schema", "required"]),
});

const combineCustomFieldValueAndMeta = (values: any, meta: any) => Object.keys(meta).reduce((fields, key) => ({
  ...fields,
  [key]: {
    value: values[key],
    meta: meta[key],
  },
}), {});

const isCustomFieldKey = (key: string): boolean => /^customfield_[0-9]+$/.test(key);

const formatCustomFieldValue = (meta: IssueMeta, value: any) => match<FieldType, any>(meta.type)
    .with(FieldType.TEXT_PLAIN, () => value)
    .with(FieldType.TEXT_PARAGRAPH, () => paragraphDoc(value))
    .with(FieldType.DATETIME, () => value)
    .with(FieldType.DATE, () => value)
    .with(FieldType.CHECKBOXES, () => (value ?? []).map((id: string) => ({ id })))
    .with(FieldType.LABELS, () => value)
    .with(FieldType.NUMBER, () => new Number(value))
    .with(FieldType.RADIO_BUTTONS, () => ({ id: value }))
    .with(FieldType.SELECT_MULTI, () => (value ?? []).map((id: string) => ({ id })))
    .with(FieldType.SELECT_SINGLE, () => ({ id: value }))
    .with(FieldType.URL, () => value)
    .with(FieldType.USER_PICKER, () => ({ id: value }))
    .run()
;
