import jiraRequest from "@/api/jiraRequest";
import { IssueBean } from "@/api/types/types";
import { IDeskproClient } from "@deskpro/app-sdk";

/**
 * Fetch a single Jira issue by its key, e.g. "DP-1"
 */
export default async function getIssueByKey(client: IDeskproClient, issueKey: string) {
  return await jiraRequest<IssueBean>(client, { endpoint: `/issue/${issueKey}?expand=editmeta` })
}