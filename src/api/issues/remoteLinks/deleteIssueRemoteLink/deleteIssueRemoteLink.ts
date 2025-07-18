import jiraRequest from "@/api/jiraRequest";
import { IDeskproClient } from "@deskpro/app-sdk";

interface DeleteIssueRemoteLinkParams {
  issueKey: string,
  remoteLinkId: number
}

export default async function deleteIssueRemoteLink(client: IDeskproClient, params: Readonly<DeleteIssueRemoteLinkParams>) {
  const { issueKey, remoteLinkId } = params
  return await jiraRequest(client,
    { method: "DELETE", endpoint: `/issue/${issueKey}/remotelink/${remoteLinkId}` }
  )
}