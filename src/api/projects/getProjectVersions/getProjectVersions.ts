import { IDeskproClient } from "@deskpro/app-sdk";
import { Version } from "@/api/types/types";
import jiraRequest from "@/api/jiraRequest";

export default async function getProjectVersions(client: IDeskproClient, projectId: string,) {
  return await jiraRequest<Version[]>(
    client,
    { endpoint: `/project/${projectId}/versions` }
  );

};