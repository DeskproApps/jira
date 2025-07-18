import { ContextSettings } from "@/types/deskpro";
import { FieldMeta } from "@/api/types/types";
import { IDeskproClient } from "@deskpro/app-sdk";
import jiraRequest from "@/api/jiraRequest";

export default async function getFields(client: IDeskproClient, settings?: ContextSettings): Promise<FieldMeta[]> {
  return jiraRequest<FieldMeta[]>(client, { endpoint: '/field', settings })
}
