import { ContextSettings } from "@/types/deskpro";
import { CreateMeta } from "@/api/types/createMeta";
import { IDeskproClient } from "@deskpro/app-sdk";
import jiraRequest from "@/api/jiraRequest";

export default async function getIssueCreateMeta(client: IDeskproClient, settings?: ContextSettings,): Promise<CreateMeta> {
  return await jiraRequest<CreateMeta>(client, { endpoint: '/issue/createmeta', settings })
}