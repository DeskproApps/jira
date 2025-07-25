import { IDeskproClient } from "@deskpro/app-sdk";
import { IssueComment } from "@/api/types/types";
import { paragraphDoc, removeBacklinkCommentDoc } from "@/api/adf";
import { TicketData } from "@/types/deskpro";
import jiraRequest from "@/api/jiraRequest";

type AddIssueCommentParams =
  | {
    isUnlinkComment: true;
    issueKey: string;
    deskproTicket: TicketData;
  }
  | {
    isUnlinkComment?: false;
    issueKey: string;
    comment: string;
  }

/**
 * Add a comment to a Jira issue.
 */
export default async function addIssueComment(
  client: IDeskproClient,
  params: Readonly<AddIssueCommentParams>
) {
  const { isUnlinkComment, issueKey } = params

  // Add a comment stating that the issue has been unlinked from the Deskpro ticket.
  if (isUnlinkComment) {
    return await jiraRequest<IssueComment>(client, {
      method: "POST",
      endpoint: `/issue/${issueKey}/comment`,
      payload: {
        body: removeBacklinkCommentDoc(params.deskproTicket.id, params.deskproTicket.permalinkUrl),
      }
    })
  }


  return await jiraRequest<IssueComment>(client, {
    method: "POST",
    endpoint: `/issue/${issueKey}/comment`,
    payload: {
      body: paragraphDoc(params.comment),
    }
  })
}

