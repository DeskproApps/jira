import jiraRequest from "@/api/jiraRequest";
import { IssueFieldsMetaResponse } from "@/api/types/types";
import { ContextSettings } from "@/types/deskpro";
import { IDeskproClient } from "@deskpro/app-sdk";

export default async function getIssueFields(client: IDeskproClient, issueKey: string, settings?: ContextSettings,
): Promise<IssueFieldsMetaResponse> {
  return jiraRequest<IssueFieldsMetaResponse>(client, { endpoint: `/issue/${issueKey}/editmeta`, settings })
};