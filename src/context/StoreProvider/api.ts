import { IDeskproClient, proxyFetch } from "@deskpro/app-sdk";
import { get, omit, orderBy } from "lodash";
import { match } from "ts-pattern";
import { useAdfToPlainText } from "../../hooks";
import { FieldType, IssueMeta } from "../../types";
import {
  backlinkCommentDoc,
  paragraphDoc,
  removeBacklinkCommentDoc,
} from "./adf";
import { CreateMeta } from "./types/createMeta";
import {
  ApiRequestMethod,
  AttachmentFile,
  Field,
  InvalidRequestResponseError,
  IssueAttachment,
  IssueFormData,
  IssueItem,
  IssueSearchItem,
  JiraComment,
  SearchParams,
} from "./types/types";
import { fetchAll } from "../../utils";
import cache from "js-cache";
// JIRA REST API Base URL
const API_BASE_URL = "https://__domain__.atlassian.net/rest/api/3";

const SEARCH_DEPS_CACHE_TTL = 1000 * 60 * 60 * 24 * 2;

// Key for search dependency caching (milliseconds)

/**
 * Fetch a single JIRA issue by key, e.g. "DP-1"
 */
export const getIssueByKey = async (client: IDeskproClient, key: string) =>
  request(client, "GET", `${API_BASE_URL}/issue/${key}?expand=editmeta`);

/**
 * Get an issue's remote links
 */
export const getRemoteLinks = async (client: IDeskproClient, key: string) =>
  request(client, "GET", `${API_BASE_URL}/issue/${key}/remotelink`);

/**
 * Add remote link
 */
export const addRemoteLink = async (
  client: IDeskproClient,
  key: string,
  ticketId: string,
  subject: string,
  url: string
) =>
  request(client, "POST", `${API_BASE_URL}/issue/${key}/remotelink`, {
    globalId: remoteLinkGlobalId(ticketId),
    object: {
      url,
      title: `Deskpro #${ticketId}`,
      summary: subject,
    },
  });

/**
 * Remove remote link
 */
export const removeRemoteLink = async (
  client: IDeskproClient,
  key: string,
  ticketId: string
) =>
  // eslint-disable-next-line no-console
  request(
    client,
    "DELETE",
    `${API_BASE_URL}/issue/${key}/remotelink?globalId=${remoteLinkGlobalId(
      ticketId
    )}`
  );

/**
 * Add "linked" comment to JIRA issue
 */
export const addLinkCommentToIssue = async (
  client: IDeskproClient,
  key: string,
  ticketId: string,
  url: string
) => {
  return request(client, "POST", `${API_BASE_URL}/issue/${key}/comment`, {
    body: backlinkCommentDoc(ticketId, url),
  });
};

/**
 * Get the status of all required Jira permissions
 */
export const getMyPermissions = async (client: IDeskproClient) => {
  const required = [
    "BROWSE_PROJECTS",
    "CREATE_ISSUES",
    "EDIT_ISSUES",
    "ASSIGN_ISSUES",
    "ADD_COMMENTS",
    "MANAGE_WATCHERS",
  ];

  return request(
    client,
    "GET",
    `${API_BASE_URL}/mypermissions?permissions=${required.join(",")}`
  );
};

/**
 * Get list of comments for a given issue key
 */
export const getIssueComments = async (
  client: IDeskproClient,
  key: string
): Promise<JiraComment[]> => {
  const data = await request(
    client,
    "GET",
    `${API_BASE_URL}/issue/${key}/comment?expand=renderedBody`
  );

  if (!data?.comments || !Array.isArray(data.comments)) {
    return [];
  }

  const comments = data.comments.map(
    (comment: any) =>
      ({
        id: comment.id,
        created: new Date(comment.created),
        updated: new Date(comment.updated),
        body: comment.body,
        renderedBody: comment.renderedBody,
        author: {
          accountId: comment.author.accountId,
          displayName: comment.author.displayName,
          avatarUrl: comment.author.avatarUrls["24x24"],
        },
      } as JiraComment)
  );

  return orderBy<JiraComment>(comments, (comment) => comment.created, ["desc"]);
};

/**
 * Add a comment to an issue
 */
export const addIssueComment = async (
  client: IDeskproClient,
  key: string,
  comment: string
) =>
  request(client, "POST", `${API_BASE_URL}/issue/${key}/comment`, {
    body: paragraphDoc(comment),
  });

/**
 * Add "unlinked" comment to JIRA issue
 */
export const addUnlinkCommentToIssue = async (
  client: IDeskproClient,
  key: string,
  ticketId: string,
  url: string
) =>
  request(client, "POST", `${API_BASE_URL}/issue/${key}/comment`, {
    body: removeBacklinkCommentDoc(ticketId, url),
  });

/**
 * Search JIRA issues
 */
export const searchIssues = async (
  client: IDeskproClient,
  q: string,
  params: SearchParams = {}
): Promise<IssueSearchItem[]> => {
  const url = `${API_BASE_URL}/issue/picker?query=${q}&currentJQL=&showSubTasks=${
    params.withSubtask ? "true" : "false"
  }${params.projectId ? `&currentProjectId=${params.projectId}` : ""}`;
  const { sections } = await request(client, "GET", url);

  const { issues: searchIssues } = sections.filter(
    (s: { id: string }) => s.id === "cs"
  )[0];
  const keys = (searchIssues ?? []).map((i: { key: string }) => i.key);

  if (!keys.length) {
    return [];
  }

  const issueJql = encodeURIComponent(`issueKey IN (${keys.join(",")})`);
  const { issues: fullIssues } = await request(
    client,
    "GET",
    `${API_BASE_URL}/search?jql=${issueJql}&expand=editmeta`
  );

  const issues = (fullIssues ?? []).reduce(
    (list: unknown[], issue: { key: string }) => ({
      ...list,
      [issue.key]: issue,
    }),
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

    return { ...list, [issue.key]: issue.fields[meta.key] };
  }, {});

  let epics: { [key: string]: any } = {};

  if (Object.values(epicKeys).length) {
    const epicJql = encodeURIComponent(
      `issueKey IN (${Object.values(epicKeys).join(",")})`
    );
    const { issues: fullEpics } = await request(
      client,
      "GET",
      `${API_BASE_URL}/search?jql=${epicJql}`
    );

    epics = (fullEpics ?? []).reduce(
      (list: unknown[], issue: { key: string }) => ({
        ...list,
        [issue.key]: issue,
      }),
      {}
    );
  }

  return (searchIssues ?? []).map(
    (searchIssue: any) =>
      ({
        id: searchIssue.id,
        key: searchIssue.key,
        keyHtml: searchIssue.keyHtml,
        summary: searchIssue.summaryText,
        summaryHtml: searchIssue.summary,
        status: get(issues, [searchIssue.key, "fields", "status", "name"], "-"),
        projectKey: get(
          issues,
          [searchIssue.key, "fields", "project", "key"],
          ""
        ),
        projectName: get(
          issues,
          [searchIssue.key, "fields", "project", "name"],
          "-"
        ),
        reporterId: get(
          issues,
          [searchIssue.key, "fields", "reporter", "accountId"],
          ""
        ),
        reporterName: get(
          issues,
          [searchIssue.key, "fields", "reporter", "displayName"],
          "-"
        ),
        reporterAvatarUrl: get(
          issues,
          [searchIssue.key, "fields", "reporter", "avatarUrls", "24x24"],
          ""
        ),
        epicKey: epics[epicKeys[searchIssue.key]]
          ? epics[epicKeys[searchIssue.key]].key
          : undefined,
        epicName: epics[epicKeys[searchIssue.key]]
          ? epics[epicKeys[searchIssue.key]].fields.summary
          : undefined,
      } as IssueSearchItem)
  );
};

/**
 * List linked issues
 */
export const listLinkedIssues = async (
  client: IDeskproClient,
  keys: string[],
  hasMappedFields: boolean
): Promise<IssueItem[]> => {
  if (!keys.length) {
    return [];
  }
  const issueJql = encodeURIComponent(`issueKey IN (${keys.join(",")})`);
  const { issues: fullIssues } = await request(
    client,
    "GET",
    `${API_BASE_URL}/search?jql=${issueJql}&expand=editmeta`
  );

  if (hasMappedFields) {
    return fullIssues.map((e: { fields: any; key: string; id: string }) => ({
      ...e.fields,
      key: e.key,
      id: e.id,
    }));
  }

  const issues = (fullIssues ?? []).reduce(
    (list: unknown[], issue: { key: string }) => ({
      ...list,
      [issue.key]: issue,
    }),
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

    return { ...list, [issue.key]: issue.fields[meta.key] };
  }, {});

  const sprints = (fullIssues ?? []).reduce((list: unknown[], issue: any) => {
    const meta = findSprintLinkMeta(issue) as { key: string } | null;
    if (!meta) {
      return list;
    }

    if (!issue.fields[meta.key]) {
      return list;
    }

    return { ...list, [issue.key]: issue.fields[meta.key] };
  }, {});

  let epics: { [key: string]: any } = {};

  if (Object.values(epicKeys).length) {
    const epicJql = encodeURIComponent(
      `issueKey IN (${Object.values(epicKeys).join(",")})`
    );
    const { issues: fullEpics } = await request(
      client,
      "GET",
      `${API_BASE_URL}/search?jql=${epicJql}`
    );

    epics = (fullEpics ?? []).reduce(
      (list: unknown[], issue: { key: string }) => ({
        ...list,
        [issue.key]: issue,
      }),
      {}
    );
  }

  return (fullIssues ?? []).map(
    (issue: any) =>
      ({
        id: issue.id,
        key: issue.key,
        summary: get(issue, ["fields", "summary"], "-"),
        status: get(issues, [issue.key, "fields", "status", "name"], "-"),
        projectKey: get(issues, [issue.key, "fields", "project", "key"], "-"),
        projectName: get(issues, [issue.key, "fields", "project", "name"], "-"),
        reporterId: get(
          issues,
          [issue.key, "fields", "reporter", "accountId"],
          ""
        ),
        reporterName: get(
          issues,
          [issue.key, "fields", "reporter", "displayName"],
          "-"
        ),
        reporterAvatarUrl: get(
          issues,
          [issue.key, "fields", "reporter", "avatarUrls", "24x24"],
          ""
        ),
        assigneeId: get(
          issues,
          [issue.key, "fields", "assignee", "accountId"],
          ""
        ),
        assigneeName: get(
          issues,
          [issue.key, "fields", "assignee", "displayName"],
          "-"
        ),
        assigneeAvatarUrl: get(
          issues,
          [issue.key, "fields", "assignee", "avatarUrls", "24x24"],
          ""
        ),
        epicKey: epics[epicKeys[issue.key]]
          ? epics[epicKeys[issue.key]].key
          : undefined,
        epicName: epics[epicKeys[issue.key]]
          ? epics[epicKeys[issue.key]].fields.summary
          : undefined,
        sprints: (sprints[issue.key] ?? []).map((sprint: any) => ({
          sprintBoardId: sprint.boardId,
          sprintName: sprint.name,
          sprintState: sprint.state,
        })),
        description: get(issues, [issue.key, "fields", "description"], "-"),
        labels: issues[issue.key].fields.labels ?? [],
        priority: issues[issue.key].fields.priority.name,
        priorityId: issues[issue.key].fields.priority.id,
        priorityIconUrl: issues[issue.key].fields.priority.iconUrl,
        customFields: combineCustomFieldValueAndMeta(
          extractCustomFieldValues(issue.fields),
          buildCustomFieldMeta(issue.editmeta.fields)
        ),
        parentKey: get(issues, [issue.key, "fields", "parent", "key"], null),
      } as IssueItem)
  );
};

/**
 * Get attachments for a JIRA issue
 */
export const getIssueAttachments = async (
  client: IDeskproClient,
  key: string
): Promise<IssueAttachment[]> => {
  const res = await request(
    client,
    "GET",
    `${API_BASE_URL}/issue/${key}?fields=attachment`
  );

  if (!res.fields.attachment) {
    return [];
  }

  return res.fields.attachment.map(
    (attachment: any) =>
      ({
        id: attachment.id,
        filename: attachment.filename,
        sizeBytes: attachment.size,
        sizeMb: attachment.size > 0 ? attachment.size / 1042 / 1024 : 0,
        url: attachment.content,
      } as IssueAttachment)
  );
};

export const createIssue = async (
  client: IDeskproClient,
  data: IssueFormData,
  meta: Record<string, IssueMeta>
) => {
  const customFields = {
    ...Object.keys(data.customFields ?? []).reduce((fields, key) => {
      const value = formatCustomFieldValue(meta[key], data.customFields?.[key]);

      if (value === undefined) {
        return fields;
      }

      return {
        ...fields,
        [key]: value,
      };
    }, {}),
  };

  // eslint-disable-next-line no-prototype-builtins
  if (data.hasOwnProperty("customFields")) {
    delete data.customFields;
  }

  const attachments = [...(data.attachments ?? [])];

  delete data.attachments;

  const body: any = {
    fields: {
      ...data,
      summary: data.summary,
      issuetype: {
        id: data.issuetype,
      },
      project: {
        id: data.project,
      },
      description: paragraphDoc(data.description),
      ...(!data.labels ? {} : { labels: data.labels }),
      ...(!data.priority ? {} : { priority: { id: data.priority } }),
      ...(!data.assignee ? {} : { assignee: { id: data.assignee } }),
      ...(!data.reporter ? {} : { reporter: { id: data.reporter } }),
      ...(!data.parent ? {} : { parent: { key: data.parent } }),
      ...customFields,
    },
  };

  const res = await request(client, "POST", `${API_BASE_URL}/issue`, body);

  if (!res.id || !res.key) {
    throw new InvalidRequestResponseError("Failed to create JIRA issue", res);
  }

  if ((attachments ?? []).length) {
    const attachmentUploads = attachments.map((attachment: AttachmentFile) => {
      if (attachment.file) {
        const form = new FormData();
        form.append(`file`, attachment.file);

        return request(
          client,
          "POST",
          `${API_BASE_URL}/issue/${res.key}/attachments`,
          form
        );
      }
    });

    await Promise.all(attachmentUploads);
  }

  return res;
};

export const getFields = async (client: IDeskproClient): Promise<Field[]> => {
  const res = await request(client, "GET", `${API_BASE_URL}/field`);

  return res;
};

export const updateIssue = async (
  client: IDeskproClient,
  issueKey: string,
  data: IssueFormData,
  meta: Record<string, IssueMeta>
) => {
  const customFields = Object.keys(data.customFields ?? []).reduce(
    (fields, key) => {
      const value = formatCustomFieldValue(meta[key], data.customFields?.[key]);

      if (value === undefined) {
        return fields;
      }

      return {
        ...fields,
        [key]: value,
      };
    },
    {}
  );

  const body: any = {
    fields: {
      summary: data.summary,
      issuetype: {
        id: data.issuetype,
      },
      project: {
        id: data.project,
      },
      description: paragraphDoc(data.description),
      ...(!data.labels ? {} : { labels: data.labels }),
      ...(!data.priority ? {} : { priority: { id: data.priority } }),
      ...(!data.assignee ? {} : { assignee: { id: data.assignee } }),
      ...(!data.reporter ? {} : { reporter: { id: data.reporter } }),
      ...(!data.parent ? {} : { parent: { key: data.parent } }),
      ...customFields,
    },
  };

  const res = await request(
    client,
    "PUT",
    `${API_BASE_URL}/issue/${issueKey}`,
    body
  );

  if (res?.errors || res?.errorMessages) {
    throw new InvalidRequestResponseError("Failed to update JIRA issue", res);
  }

  if ((data.attachments ?? []).length) {
    const attachmentUploads = (data.attachments ?? []).map(
      (attachment: AttachmentFile) => {
        if (attachment.file) {
          const form = new FormData();
          form.append(`file`, attachment.file);

          return request(
            client,
            "POST",
            `${API_BASE_URL}/issue/${issueKey}/attachments`,
            form
          );
        }

        if (attachment.id && attachment.delete) {
          return request(
            client,
            "DELETE",
            `${API_BASE_URL}/attachment/${attachment.id}`
          );
        }
      }
    );

    await Promise.all(attachmentUploads);
  }

  return res;
};

export const getCreateMeta = async (
  client: IDeskproClient
): Promise<CreateMeta> => {
  const res = await request(
    client,
    "GET",
    `${API_BASE_URL}/issue/createmeta?expand=projects.issuetypes.fields`
  );

  return res;
};

export const getVersionsByProjectId = async (
  client: IDeskproClient,
  projectId: string
) => {
  const cache_key = "versions";

  const cachedData = await client.getState(cache_key);

  if (!cachedData[0]?.data || !(cachedData[0]?.data as string[]).length) {
    const res = await request(
      client,
      "GET",
      `${API_BASE_URL}/project/${projectId}/versions`
    );

    await client.setState(cache_key, res, {
      expires: new Date(Date.now() + SEARCH_DEPS_CACHE_TTL),
    });

    return res;
  }

  return cachedData[0].data;
};

export const getUsers = async (client: IDeskproClient) => {
  const res = await request(
    client,
    "GET",
    `${API_BASE_URL}/users/search?maxResults=999`
  );

  return res;
};

export const getLabels = async (client: IDeskproClient): Promise<string[]> => {
  const cache_key = "labels";
  const requestWithFetchAll = fetchAll(request);

  const cachedData = await client.getState(cache_key);

  if (!cachedData[0]?.data || !(cachedData[0]?.data as string[]).length) {
    const res = await requestWithFetchAll(
      client,
      "GET",
      `${API_BASE_URL}/label`
    );

    await client.setState(cache_key, res, {
      expires: new Date(Date.now() + SEARCH_DEPS_CACHE_TTL),
    });

    return res as string[];
  }

  return cachedData[0].data as string[];
};

export const getIssueDependencies = async (client: IDeskproClient) => {
  const cache_key = "data_deps";
  const requestWithFetchAll = fetchAll(request);

  if (!cache.get(cache_key)) {
    const dependencies = [
      request(
        client,
        "GET",
        `${API_BASE_URL}/issue/createmeta?expand=projects.issuetypes.fields`
      ),
      requestWithFetchAll(client, "GET", `${API_BASE_URL}/project/search`),
      request(client, "GET", `${API_BASE_URL}/users/search?maxResults=999`),
      requestWithFetchAll(client, "GET", `${API_BASE_URL}/label`),
    ];

    const [createMeta, projects, users, labels] = await Promise.all(
      dependencies
    );

    const resolved = {
      createMeta,
      projects: projects || [],
      users,
      labels: labels || [],
    };

    cache.set(cache_key, resolved, SEARCH_DEPS_CACHE_TTL);
  }

  return cache.get(cache_key);
};

const request = async (
  client: IDeskproClient,
  method: ApiRequestMethod,
  url: string,
  content?: any
) => {
  const dpFetch = await proxyFetch(client);

  let body = undefined;

  if (content instanceof FormData) {
    body = content;
  } else if (content) {
    body = JSON.stringify(content);
  }

  const headers: Record<string, string> = {
    Authorization: "Basic __username+':'+api_key.base64__",
    Accept: "application/json",
  };

  if (body instanceof FormData) {
    headers["X-Atlassian-Token"] = "no-check";
  } else if (content) {
    headers["Content-Type"] = "application/json";
  }

  const res = await dpFetch(url, {
    method,
    body,
    headers,
  });

  if (res.status === 400) {
    return res.json();
  }

  if (res.status < 200 || res.status >= 400) {
    throw new Error(`${method} ${url}: Response Status [${res.status}]`);
  }

  try {
    return await res.json();
  } catch (e) {
    return {};
  }
};

export const buildCustomFieldMeta = (fields: any) => {
  const customFields: Record<string, any> = extractCustomFieldMeta(fields);

  return Object.keys(customFields).reduce(
    (fields, key) => ({
      ...fields,
      [key]: transformFieldMeta(customFields[key]),
    }),
    {}
  );
};

const findEpicLinkMeta = (issue: any) =>
  Object.values(issue.editmeta.fields).filter(
    (field: any) =>
      field.schema.custom === "com.pyxis.greenhopper.jira:gh-epic-link"
  )[0] ?? null;
const findSprintLinkMeta = (issue: any) =>
  Object.values(issue.editmeta.fields).filter(
    (field: any) =>
      field.schema.custom === "com.pyxis.greenhopper.jira:gh-sprint"
  )[0] ?? null;
const extractCustomFieldMeta = (fields: any) =>
  Object.keys(fields).reduce((customFields, key) => {
    if (!isCustomFieldKey(key)) {
      return customFields;
    }

    return { ...customFields, [key]: fields[key] };
  }, {});

export const extractCustomFieldValues = (fields: any) =>
  Object.keys(fields).reduce((customFields, key) => {
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

const combineCustomFieldValueAndMeta = (values: any, meta: any) =>
  Object.keys(meta).reduce(
    (fields, key) => ({
      ...fields,
      [key]: {
        value: values[key],
        meta: meta[key],
      },
    }),
    {}
  );

const isCustomFieldKey = (key: string): boolean =>
  /^customfield_[0-9]+$/.test(key);

const remoteLinkGlobalId = (ticketId: string) => `deskpro_ticket_${ticketId}`;

/**
 * Format fields when sending values to API
 */
const formatCustomFieldValue = (meta: IssueMeta, value: any) =>
  match<FieldType, any>(meta.type)
    .with(FieldType.TEXT_PLAIN, () => value ?? undefined)
    .with(FieldType.TEXT_PARAGRAPH, () =>
      value ? paragraphDoc(value) : undefined
    )
    .with(FieldType.DATETIME, () => value ?? undefined)
    .with(FieldType.DATE, () => value ?? undefined)
    .with(FieldType.CHECKBOXES, () =>
      (value ?? []).map((id: string) => ({ id }))
    )
    .with(FieldType.LABELS, () => value ?? [])
    .with(FieldType.NUMBER, () => (value ? new Number(value) : undefined))
    .with(FieldType.RADIO_BUTTONS, () => (value ? { id: value } : undefined))
    .with(FieldType.SELECT_MULTI, () =>
      (value ?? []).map((id: string) => ({ id }))
    )
    .with(FieldType.SELECT_SINGLE, () => (value ? { id: value } : undefined))
    .with(FieldType.URL, () => value ?? undefined)
    .with(FieldType.USER_PICKER, () => (value ? { id: value } : undefined))
    .run();
/**
 * Format data when getting values from the API
 */
export const formatCustomFieldValueForSet = (meta: IssueMeta, value: any) =>
  match<FieldType, any>(meta.type)
    .with(FieldType.TEXT_PLAIN, () => value ?? "")
    .with(FieldType.TEXT_PARAGRAPH, () => useAdfToPlainText()(value))
    .with(FieldType.DATETIME, () => (value ? new Date(value) : undefined))
    .with(FieldType.DATE, () => (value ? new Date(value) : undefined))
    .with(FieldType.CHECKBOXES, () =>
      (value ?? []).map((v: { id: string }) => v.id)
    )
    .with(FieldType.LABELS, () => value ?? [])
    .with(FieldType.NUMBER, () => (value ? `${value}` : ""))
    .with(FieldType.RADIO_BUTTONS, () => value?.id ?? undefined)
    .with(FieldType.SELECT_MULTI, () =>
      (value ?? []).map((v: { id: string }) => v.id)
    )
    .with(FieldType.SELECT_SINGLE, () => value?.id ?? undefined)
    .with(FieldType.URL, () => value ?? "")
    .with(FieldType.USER_PICKER, () => value?.accountId ?? undefined)
    .otherwise(() => undefined);
