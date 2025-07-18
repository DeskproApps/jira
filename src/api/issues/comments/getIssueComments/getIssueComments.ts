import jiraRequest from "@/api/jiraRequest";
import { JiraComment, IssueComment } from "@/api/types/types";
import { IDeskproClient } from "@deskpro/app-sdk";

/**
 * Get list of comments for a given issue key
 */
export default async function getIssueComments(
  client: IDeskproClient,
  issueKey: string,
): Promise<JiraComment[]> {
  const data = await jiraRequest<{ comments: Array<IssueComment> }>(
    client,
    { endpoint: `/issue/${issueKey}/comment?expand=renderedBody` }
  );

  if (data.comments?.length === 0) {
    return [];
  }

  const comments = data.comments.map((comment) => ({
    id: comment.id,
    created: new Date(comment.created),
    updated: new Date(comment.updated),
    body: comment.body,
    renderedBody: comment.renderedBody,
    author: {
      accountId: comment.author.accountId,
      displayName: comment.author.displayName,
      avatarUrl: comment.author.avatarUrls["24x24"],
    },
  }),
  );

  return comments.sort((a, b) => b.created.getTime() - a.created.getTime());
};