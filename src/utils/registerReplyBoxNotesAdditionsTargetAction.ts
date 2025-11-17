import { IDeskproClient } from "@deskpro/app-sdk";
import { IssueItem } from "../api/types/types";

const ticketReplyNotesSelectionStateKey = (
  ticketId: string,
  issueId: string | number,
) => `tickets/${ticketId}/notes/selection/${issueId}`;

const registerReplyBoxNotesAdditionsTargetAction = async (
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
        ticketReplyNotesSelectionStateKey(ticketId, issue.id),
      ),
    ),
  ).then((flags) => {
    return client.registerTargetAction(
      "jiraReplyBoxNoteAdditions",
      "reply_box_note_item_selection",
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
  ticketReplyNotesSelectionStateKey,
  registerReplyBoxNotesAdditionsTargetAction,
};
