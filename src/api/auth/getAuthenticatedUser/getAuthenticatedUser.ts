import { IDeskproClient } from "@deskpro/app-sdk";
import { User } from "@/api/types/types";
import jiraRequest, { CredentialMode } from "@/api/jiraRequest";
import { ContextSettings } from "@/types/deskpro";

interface GetAuthenticatedUserParams {
  credentialMode?: CredentialMode
  cloudID?: string
  settings?: ContextSettings
}

export default async function getAuthenticatedUser(
  client: IDeskproClient,
  params: Readonly<GetAuthenticatedUserParams> = {},
){
  return await jiraRequest<User>(client, {
    endpoint: "/myself",
    ...params,
  })
}
