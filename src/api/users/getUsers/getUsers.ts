import jiraRequest from "@/api/jiraRequest";
import { IDeskproClient } from "@deskpro/app-sdk";

export default async function getUsers(client: IDeskproClient) {
  return await jiraRequest(
    client,
    {endpoint: `/users/search?maxResults=999`}
  );
};