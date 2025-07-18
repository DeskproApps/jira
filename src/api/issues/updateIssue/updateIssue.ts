import jiraRequest from "@/api/jiraRequest";
import { AttachmentFile, IssueBean, IssueFormData } from "@/api/types/types";
import { IDeskproClient } from "@deskpro/app-sdk";

interface UpdateIssueParams {
  issueKey: string,
  issueData: IssueFormData
}

export default async function updateIssue(client: IDeskproClient, params: Readonly<UpdateIssueParams>) {
  const { issueData, issueKey } = params
  const body = {
    fields: {
      ...issueData,
      ...(!issueData.labels ? {} : { labels: issueData.labels }),
    },
  };

  const res = await jiraRequest<IssueBean>(
    client,
    {
      method: "PUT",
      endpoint: `/issue/${issueKey}`,
      payload: body,
    }
  );

  // @todo Revisit this
  // if ((res as unknown as ErrorResponse)?.errors || (res as unknown as ErrorResponse)?.errorMessages) {
  //   throw new InvalidRequestResponseError("Failed to update JIRA issue", res as unknown as ErrorResponse);
  // }

  if ((issueData.attachments ?? []).length) {
    const attachmentUploads = (issueData.attachments ?? []).map(
      (attachment: AttachmentFile) => {
        if (attachment.file) {
          const form = new FormData();
          form.append(`file`, attachment.file);

          return jiraRequest(
            client,
            {
              method: "POST",
              endpoint: `/issue/${issueKey}/attachments`,
              payload: form,
            }
          );
        }

        if (attachment.id && attachment.delete) {
          return jiraRequest(
            client,
            {
              method: "DELETE",
              endpoint: `/attachment/${attachment.id}`,
            }
          );
        }
      },
    );

    await Promise.all(attachmentUploads);
  }

  return res;
};