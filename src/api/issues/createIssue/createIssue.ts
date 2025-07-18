import jiraRequest from "@/api/jiraRequest";
import { AttachmentFile, IssueBean, IssueFormData } from "@/api/types/types";
import { IDeskproClient } from "@deskpro/app-sdk";

export default async function createIssue(client: IDeskproClient, issueData: IssueFormData) {
  const attachments = [...(issueData.attachments ?? [])];

  delete issueData.attachments;

  const body = {
    fields: {
      ...issueData,
      ...(!issueData.labels ? {} : { labels: issueData.labels }),
    },
  };

  const res = await jiraRequest<IssueBean>(client, { method: "POST", endpoint: '/issue', payload: body });

  if ((attachments ?? []).length) {
    const attachmentUploads = attachments.map((attachment: AttachmentFile) => {
      if (attachment.file) {
        const form = new FormData();
        form.append(`file`, attachment.file);

        return jiraRequest(
          client,
          {
            method: "POST",
            endpoint: `/issue/${res.key}/attachments`,
            payload: form
          }
        );
      }
    });

    await Promise.all(attachmentUploads);
  }

  return res
}