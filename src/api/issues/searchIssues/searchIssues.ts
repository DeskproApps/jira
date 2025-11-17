import jiraRequest from "@/api/jiraRequest";
import { SearchParams, SearchIssueItem, IssuesPicker, SearchIssues, IssueBean, FieldMeta } from "@/api/types/types";
import { findEpicLinkMeta } from "@/api/utils";
import { IDeskproClient } from "@deskpro/app-sdk";

/**
 * Search Jira issues
 */
export default async function searchIssues(client: IDeskproClient, searchQuery: string, params: SearchParams = {}): Promise<SearchIssueItem[]> {
  const endpoint = `/issue/picker?query=${searchQuery}&currentJQL=&showSubTasks=${params.withSubtask ? "true" : "false"
    }${params.projectId ? `&currentProjectId=${params.projectId}` : ""}`;
  const { sections } = await jiraRequest<IssuesPicker>(client, { endpoint });
  const { issues: searchIssues } = (sections ?? []).find((s) => s.id === "cs") || {};
  const keys = (searchIssues ?? []).map((i) => i.key);

  if (!keys.length) {
    return [];
  }

  const issueJql = encodeURIComponent(`issueKey IN (${keys.join(",")})`);
  const { issues: fullIssues } = await jiraRequest<SearchIssues>(
    client,
    { endpoint: `/search/jql?jql=${issueJql}&expand=editmeta&fields=*all` },
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

    const { issues: fullEpics } = await jiraRequest<SearchIssues>(
      client,
      { endpoint: `/search/jql?jql=${epicJql}&fields=*all` },
    );

    epics = (fullEpics ?? []).reduce((list, issue) => ({
      ...list,
      [issue.key]: issue,
    }), {});
  }

  return (searchIssues ?? []).map((searchIssue) => {
    const issueFields: IssueBean["fields"] | undefined = issues[searchIssue.key]?.fields;
    const epic: IssueBean | undefined = epics[epicKeys[searchIssue.key]];

    return {
      ...(issueFields ?? {}),
      id: `${searchIssue.id}`,
      key: searchIssue.key,
      keyHtml: searchIssue.keyHtml,
      summary: searchIssue.summaryText,
      summaryHtml: searchIssue.summary,
      status: issueFields?.status?.name || "-",
      projectKey: issueFields?.project?.key ?? "",
      projectName: issueFields?.project?.name ?? "-",
      reporterId: issueFields?.reporter?.accountId ?? "",
      reporterName: issueFields?.reporter?.displayName ?? "-",
      reporterAvatarUrl: (issueFields?.reporter?.avatarUrls ?? {})["24x24"] ?? "",
      epicKey: epic?.key,
      epicName: epic?.fields?.summary,
    };
  });
};

