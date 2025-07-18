import { IDeskproClient } from "@deskpro/app-sdk";
import { User } from "@/api/types/types";
import jiraRequest from "@/api/jiraRequest";

export default async function getAuthenticatedUser(client: IDeskproClient){
  return await jiraRequest<User>(client, {
    endpoint: "/myself"
  })
}