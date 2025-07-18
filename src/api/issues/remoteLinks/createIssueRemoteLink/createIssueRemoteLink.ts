import jiraRequest from "@/api/jiraRequest";
import { Schemas } from "@/api/types/types";
import { TicketData } from "@/types/deskpro";
import { IDeskproClient } from "@deskpro/app-sdk";

interface CreateRemoteLinkParams {
  issueKey: string
  deskproTicket: TicketData
}

/**
 * Add a web link to a Jira issue.
 */
export default async function createIssueRemoteLink(client: IDeskproClient, params: Readonly<CreateRemoteLinkParams>) {
  const { issueKey, deskproTicket } = params
  return await jiraRequest<Schemas["RemoteIssueLinkIdentifies"]>(client,
    {
      method: "POST",
      endpoint: `/issue/${issueKey}/remotelink`,
      payload: {
        globalId: `deskpro_ticket_${deskproTicket.id}`,
        object: {
          url: deskproTicket.permalinkUrl,
          title: `Deskpro #${deskproTicket.id}`,
          summary: deskproTicket.subject
        }
      }
    }
  )
}