import { IDeskproClient, proxyFetch, adminGenericProxyFetch } from "@deskpro/app-sdk";
import { paragraphDoc, removeBacklinkCommentDoc } from "./adf";
import { CreateMeta } from "./types/createMeta";
import { ApiRequestMethod, FieldType, Settings } from "../types";
import {
  AttachmentFile,
  InvalidRequestResponseError,
  IssueFormData,
  IssueItem,
  JiraComment,
  SearchParams,
  SearchResponse,
  IssuesPicker,
  IssueBean,
  SearchIssues,
  FieldMeta,
  SearchIssueItem,
  Schemas,
  IssueComment,
  FieldsValues,
  TransfornedFieldMeta,
  Version,
  ErrorResponse,
  GroupsPicker,
} from "./types/types";
import { SprintValue, CustomFieldValue, CustomFieldsValues } from "./types/customFieldsValue";
import { CLOUD_ID_PATH, IS_USING_OAUTH2, OAUTH2_ACCESS_TOKEN_PATH } from '../constants';

// Key for search dependency caching (milliseconds)

/**
 * Fetch a single JIRA issue by key, e.g. "DP-1"
 */
export const getIssueByKey = async (client: IDeskproClient, key: string) =>
  request<IssueBean>(client, "GET", `/issue/${key}?expand=editmeta`);

/**
 * Add remote link
 */
export const addRemoteLink = async (
  client: IDeskproClient,
  key: string,
  ticketId: string,
  subject: string,
  url: string,
) =>
  request<Schemas["RemoteIssueLinkIdentifies"]>(client, "POST", `/issue/${key}/remotelink`, {
    globalId: remoteLinkGlobalId(ticketId),
    object: {
      url,
      title: `Deskpro #${ticketId}`,
      summary: subject,
    },
  });

/**
 * Get list of comments for a given issue key
 */
export const getIssueComments = async (
  client: IDeskproClient,
  key: string,
): Promise<JiraComment[]> => {
  const data = await request<{ comments: Array<IssueComment> }>(
    client,
    "GET",
    `/issue/${key}/comment?expand=renderedBody`,
  );

  if (data.comments?.length === 0) {
    return [];
  }

  const comments = data.comments.map((comment) => ({
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
    }),
  );

  return comments.sort((a, b) => b.created.getTime() - a.created.getTime());
};

/**
 * Add a comment to an issue
 */
export const addIssueComment = async (
  client: IDeskproClient,
  key: string,
  comment: string,
) =>
  request<IssueComment>(client, "POST", `/issue/${key}/comment`, {
    body: paragraphDoc(comment),
  });

/**
 * Add "unlinked" comment to JIRA issue
 */
export const addUnlinkCommentToIssue = async (
  client: IDeskproClient,
  key: string,
  ticketId: string,
  url: string,
) =>
  request<IssueComment>(client, "POST", `/issue/${key}/comment`, {
    body: removeBacklinkCommentDoc(ticketId, url),
  });

/**
 * Search JIRA issues
 */
export const searchIssues = async (
  client: IDeskproClient,
  q: string,
  params: SearchParams = {},
): Promise<SearchIssueItem[]> => {
  const endpoint = `/issue/picker?query=${q}&currentJQL=&showSubTasks=${
    params.withSubtask ? "true" : "false"
  }${params.projectId ? `&currentProjectId=${params.projectId}` : ""}`;
  const { sections } = await request<IssuesPicker>(client, "GET", endpoint);
  const { issues: searchIssues } = (sections ?? []).find((s) => s.id === "cs") || {};
  const keys = (searchIssues ?? []).map((i) => i.key);

  if (!keys.length) {
    return [];
  }

  const issueJql = encodeURIComponent(`issueKey IN (${keys.join(",")})`);
  const { issues: fullIssues } = await request<SearchIssues>(
    client,
    "GET",
    `/search?jql=${issueJql}&expand=editmeta`,
  );

  const issues: Record<IssueBean["key"], IssueBean> = (fullIssues ?? []).reduce((list, issue) => ({
    ...list,
    [issue.key]: issue,
  }), {});

  const epicKeys: Record<IssueBean["key"], FieldMeta["key"]> = (fullIssues ?? []).reduce((list, issue) => {
    const meta = findEpicLinkMeta(issue);

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

    const { issues: fullEpics } = await request<SearchIssues>(
      client,
      "GET",
      `/search?jql=${epicJql}`,
    );

    epics = (fullEpics ?? []).reduce((list, issue) => ({
      ...list,
      [issue.key]: issue,
    }), {});
  }

  return (searchIssues ?? []).map((searchIssue) => {
    const issueFields: IssueBean["fields"] = issues[searchIssue.key]?.fields;
    const epic: IssueBean|undefined = epics[epicKeys[searchIssue.key]];

    return {
      ...(issueFields ?? {}),
      id: `${searchIssue.id}`,
      key: searchIssue.key,
      keyHtml: searchIssue.keyHtml,
      summary: searchIssue.summaryText,
      summaryHtml: searchIssue.summary,
      status: issueFields.status?.name || "-",
      projectKey: issueFields.project?.key ?? "",
      projectName: issueFields.project?.name ?? "-",
      reporterId: issueFields.reporter?.accountId ?? "",
      reporterName: issueFields.reporter?.displayName ?? "-",
      reporterAvatarUrl: (issueFields.reporter?.avatarUrls ?? {})["24x24"] ?? "",
      epicKey: epic?.key,
      epicName: epic?.fields?.summary,
    };
  });
};

/**
 * List linked issues
 */
export const listLinkedIssues = async (
  client: IDeskproClient,
  keys: string[],
): Promise<IssueItem[]> => {
  if (!keys.length) {
    return [];
  }
  const issueJql = encodeURIComponent(`issueKey IN (${keys.join(",")})`);

  const { issues: fullIssues } = await request<SearchIssues>(
    client,
    "GET",
    `/search?jql=${issueJql}&expand=editmeta`,
  );

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
    const { issues: fullEpics } = await request<SearchIssues>(
      client,
      "GET",
      `/search?jql=${epicJql}`,
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

export const getFields = async (
  client: IDeskproClient,
  settings?: Settings,
): Promise<FieldMeta[]> => {
  return request<FieldMeta[]>(client, "GET", '/field', undefined, settings)
};

export const createIssue = async (
  client: IDeskproClient,
  data: IssueFormData,
) => {
  const attachments = [...(data.attachments ?? [])];

  delete data.attachments;

  const body = {
    fields: {
      ...data,
      ...(!data.labels ? {} : { labels: data.labels }),
    },
  };

  const res = await request<IssueBean>(client, "POST", '/issue', body);

  if ((res as unknown as ErrorResponse)?.errors || (res as unknown as ErrorResponse)?.errorMessages) {
    throw new InvalidRequestResponseError("Failed to create JIRA issue", res as unknown as ErrorResponse);
  }

  if ((attachments ?? []).length) {
    const attachmentUploads = attachments.map((attachment: AttachmentFile) => {
      if (attachment.file) {
        const form = new FormData();
        form.append(`file`, attachment.file);

        return request(
          client,
          "POST",
          `/issue/${res.key}/attachments`,
          form,
        );
      }
    });

    await Promise.all(attachmentUploads);
  }

  return res;
};

export const updateIssue = async (
  client: IDeskproClient,
  issueKey: string,
  data: IssueFormData,
) => {
  const body = {
    fields: {
      ...data,
      ...(!data.labels ? {} : { labels: data.labels }),
    },
  };

  const res = await request<IssueBean>(
    client,
    "PUT",
    `/issue/${issueKey}`,
    body,
  );

  if ((res as unknown as ErrorResponse)?.errors || (res as unknown as ErrorResponse)?.errorMessages) {
    throw new InvalidRequestResponseError("Failed to update JIRA issue", res as unknown as ErrorResponse);
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
            `/issue/${issueKey}/attachments`,
            form,
          );
        }

        if (attachment.id && attachment.delete) {
          return request(
            client,
            "DELETE",
            `/attachment/${attachment.id}`,
          );
        }
      },
    );

    await Promise.all(attachmentUploads);
  }

  return res;
};

export const getCreateMeta = async (
  client: IDeskproClient,
  settings?: Settings,
): Promise<CreateMeta> => {
  const res = await request<CreateMeta>(client, "GET", '/issue/createmeta', undefined, settings);

  return res;
};

export const getProjectCreateMeta = async (
  client: IDeskproClient,
  projectId: string,
  issueTypeId: string,
): Promise<{ fields: FieldMeta[] }> => {
  return request(
    client,
    "GET",
    `/issue/createmeta/${projectId}/issuetypes/${issueTypeId}`,
  );
};

export const getVersionsByProjectId = async (
  client: IDeskproClient,
  projectId: string,
) => {
  const res = await request<Version[]>(
    client,
    "GET",
    `/project/${projectId}/versions`,
  );

    return res;
};

export const getUsers = async (client: IDeskproClient) => {
  const res = await request(
    client,
    "GET",
    `/users/search?maxResults=999`,
  );

  return res;
};

export const fetchAll = <T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (...args: any) => Promise<SearchResponse<T>>,
) => {
  const MAX = 999;

  return async (client: IDeskproClient, method: string, baseUrl: string) => {
    const firstResponses = await fn(
      client,
      method,
      `${baseUrl}?maxResults=${MAX}&startAt=0`,
    );
    const { total } = firstResponses;

    if (total < MAX) {
      return firstResponses.values;
    }

    const requests = new Array(10)
      .fill(0)
      .map((_, idx) => idx + 1)
      .map((idx) =>
        fn(
          client,
          method,
          `${baseUrl}?maxResults=${MAX}&startAt=${(idx + 1) * MAX}`,
        ),
      );

    const responses = await Promise.all(requests);

    return [
      ...firstResponses.values,
      ...responses.map(({ values }) => values).flat(),
    ];
  };
};

export const getLabels = async (client: IDeskproClient) => {
  const requestWithFetchAll = fetchAll<string>(request);
  const res = await requestWithFetchAll(
    client,
    "GET",
    `/label`,
  );

  return res;
};

export const getGroups = (client: IDeskproClient) => {
  return request<GroupsPicker>(client, "GET", `/groups/picker`);
};

const request = async <T>(
  client: IDeskproClient,
  method: ApiRequestMethod,
  endpoint: string,
  content?: object,
  settings?: Settings,
): Promise<T> => {
  const isAdmin = Boolean(settings?.username && settings?.api_key);
  const dpFetch = await (isAdmin ? adminGenericProxyFetch : proxyFetch)(client);
  const isUsingOAuth2 = (await client.getUserState<boolean>(IS_USING_OAUTH2))[0]?.data;
  const cloudID = (await client.getUserState<string>(CLOUD_ID_PATH))[0]?.data;

  const baseURL = isUsingOAuth2 ? `https://api.atlassian.com/ex/jira/${cloudID}/rest/api/3`
    : isAdmin
      ? `https://${settings?.domain}.atlassian.net/rest/api/3`
      : `https://__domain__.atlassian.net/rest/api/3`;
  const url = baseURL + endpoint;

  const auth = isUsingOAuth2 ? `Bearer [user[${OAUTH2_ACCESS_TOKEN_PATH}]]`
    : isAdmin
      ? `Basic ${btoa(`${settings?.username}:${settings?.api_key}`)}`
      : "Basic __username+':'+api_key.base64__";

  let body = undefined;

  if (content instanceof FormData) {
    body = content;
  } else if (content) {
    body = JSON.stringify(content);
  }

  const headers: Record<string, string> = {
    Authorization: auth,
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
    return res.json() as Promise<T>;
  }

  if (res.status < 200 || res.status >= 400) {
    throw new Error(`${method} ${url}: Response Status [${res.status}]`);
  }

  try {
    return await res.json() as Promise<T>;
  } catch (e) {
    return {} as Promise<T>;
  }
};

export const buildCustomFieldMeta = (
  fields: IssueBean["editmeta"]["fields"]
): Record<FieldMeta["key"], TransfornedFieldMeta|FieldMeta> => {
  const customFields = extractCustomFieldMeta(fields);

  return Object.keys(customFields).reduce((fields, key) => {
    return {
      ...fields,
      [key]: transformFieldMeta(customFields[key]),
    };
  }, {});
};

const findEpicLinkMeta = (issue: IssueBean): FieldMeta|null => {
  return Object.values(issue?.editmeta?.fields ?? {}).filter((field) => {
    return field.schema.custom === FieldType.EPIC;
  })[0] ?? null;
};

const findSprintLinkMeta = (issue: IssueBean): FieldMeta|null => {
  return Object.values(issue?.editmeta?.fields ?? {}).filter((field) => {
    return field.schema.custom === FieldType.SPRINT;
  })[0] ?? null;
};

const extractCustomFieldMeta = (
  fields: IssueBean["editmeta"]["fields"],
): IssueBean["editmeta"]["fields"] => {
  return Object.keys(fields).reduce((customFields, key) => {
    if (!isCustomFieldKey(key)) {
      return customFields;
    }

    return { ...customFields, [key]: fields[key] };
  }, {});
};

export const extractCustomFieldValues = (
  fields: FieldsValues,
): CustomFieldsValues => {
  return Object.keys(fields).reduce((customFields, key) => {
    if (!isCustomFieldKey(key)) {
      return customFields;
    }

    return { ...customFields, [key]: fields[key] };
  }, {});
};

export const transformFieldMeta = (field: FieldMeta): TransfornedFieldMeta => {
  return {
    ...field,
    type: field.schema?.custom as FieldType,
  };
};

const combineCustomFieldValueAndMeta = (
  values: CustomFieldsValues,
  meta: Record<FieldMeta["key"], TransfornedFieldMeta|FieldMeta>,
): Record<FieldMeta["key"], { value: CustomFieldValue, meta: FieldMeta }> => {
  return Object.keys(meta).reduce((fields, key) => ({
    ...fields,
    [key]: {
      value: values[key],
      meta: meta[key],
    },
  }), {});
};

const isCustomFieldKey = (key: string): boolean => /^customfield_[0-9]+$/.test(key);

const remoteLinkGlobalId = (ticketId: string) => `deskpro_ticket_${ticketId}`;