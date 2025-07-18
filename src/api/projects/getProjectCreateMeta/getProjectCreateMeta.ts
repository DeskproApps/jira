import jiraRequest from "@/api/jiraRequest";
import { FieldMeta } from "@/api/types/types";
import { IDeskproClient } from "@deskpro/app-sdk";

interface GetProjectCreateMeta {
  projectId: string,
  issueTypeId: string,
}

export default async function getProjectCreateMeta(client: IDeskproClient, params: Readonly<GetProjectCreateMeta>): Promise<{ fields: FieldMeta[] }> {
  const { projectId, issueTypeId } = params
  return await jiraRequest(
    client,
    { endpoint: `/issue/createmeta/${projectId}/issuetypes/${issueTypeId}` },
  );
};
