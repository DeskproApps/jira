import { IDeskproClient, proxyFetch } from "@deskpro/app-sdk";
import {ApiRequestMethod, CreateIssueData, IssueAttachment, IssueItem, IssueSearchItem} from "./types";
import {backlinkCommentDoc, paragraphDoc, removeBacklinkCommentDoc} from "./adf";
import cache from "js-cache";

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

export const createIssue = async (client: IDeskproClient, data: CreateIssueData) => {
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
      ...data.customFields,
    },
  };

   const res = await request(client, "POST", `${API_BASE_URL}/issue`, body);

   if (!res.id || !res.key) {
     throw new Error("Failed to create JIRA issue");
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
    ];

    const [
      createMeta,
      projects,
      users,
    ] = await Promise.all(dependencies);

    const resolved = {
      createMeta,
      projects: projects.values ?? [],
      users,
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

const findEpicLinkMeta = (issue: any) => Object
  .values(issue.editmeta.fields)
  .filter((field: any) => field.schema.custom === "com.pyxis.greenhopper.jira:gh-epic-link")[0] ?? null
;

const findSprintLinkMeta = (issue: any) => Object
  .values(issue.editmeta.fields)
  .filter((field: any) => field.schema.custom === "com.pyxis.greenhopper.jira:gh-sprint")[0] ?? null
;
