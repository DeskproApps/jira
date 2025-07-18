import jiraRequest from "@/api/jiraRequest";
import { GroupsPicker } from "@/api/types/types";
import { IDeskproClient } from "@deskpro/app-sdk";

export default async function getGroups(client: IDeskproClient) {
  return await jiraRequest<GroupsPicker>(
    client,
    {endpoint: `/groups/picker`}
  );
};