import jiraRequest from "@/api/jiraRequest";
import { AttachmentFile, IssueFormData } from "@/api/types/types";
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

  const res = await jiraRequest<undefined>(
    client,
    {
      method: "PUT",
      endpoint: `/issue/${issueKey}`,
      payload: body,
    }
  );
  
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