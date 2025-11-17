import { IDeskproClient } from "@deskpro/app-sdk";
import { IssueItem } from "../api/types/types";

const ticketReplyEmailsSelectionStateKey = (
  ticketId: string,
  issueId: string | number,
) => `tickets/${ticketId}/emails/selection/${issueId}`;

const registerReplyBoxEmailsAdditionsTargetAction = async (
  client: IDeskproClient,
  ticketId: string,
  linkedIssues: IssueItem[],
) => {
  if (!ticketId) {
    return;
  }

  await Promise.all(
    linkedIssues.map((issue) =>
      client.getState<{ selected: boolean }>(
        ticketReplyEmailsSelectionStateKey(ticketId, issue.id),
      ),
    ),
  ).then((flags) => {
    return client.registerTargetAction(
      "jiraReplyBoxEmailAdditions",
      "reply_box_email_item_selection",
      {
        title: "Add to Jira",
        payload: (linkedIssues ?? []).map((issue, idx) => ({
          id: issue.id,
          title: issue.key,
          selected: flags[idx][0]?.data?.selected ?? false,
        })),
      },
    );
  });
};

export {
  ticketReplyEmailsSelectionStateKey,
  registerReplyBoxEmailsAdditionsTargetAction,
};
