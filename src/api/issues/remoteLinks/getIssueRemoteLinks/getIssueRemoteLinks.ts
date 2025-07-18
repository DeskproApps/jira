import { IDeskproClient } from "@deskpro/app-sdk";
import jiraRequest from "@/api/jiraRequest";

interface RemoteLink {
  application: Record<string, unknown>
  globalId: string
  id: number
  self: string
  object?: {
    url: string,
    summary: string
    title?: string
  }
}

export default async function getIssueRemoteLinks(client: IDeskproClient, issueKey: string) {
  return await jiraRequest<RemoteLink[]>(client, { endpoint: `/issue/${issueKey}/remotelink` })
}