import { OAUTH2_ACCESS_TOKEN_PATH } from "@/constants";
import { IDeskproClient, proxyFetch } from "@deskpro/app-sdk";

interface AccessibleSite {
  id: string
  name: string
  url: string
  scopes: string[]
}

export default async function getAccessibleSites(client: IDeskproClient) {
  const dpFetch = await proxyFetch(client)
  try {
    const response = await dpFetch('https://api.atlassian.com/oauth/token/accessible-resources', {
      headers: {
        'Authorization': `Bearer [user[${OAUTH2_ACCESS_TOKEN_PATH}]]`
      }
    })

    if (!response.ok) {
      throw new Error(`An error occurred while retrieving accessible sites, status: ${response.status}`)
    }

    return await response.json() as AccessibleSite[]

  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "An unknown error while retrieving accessible sites."
    throw new Error(errorMessage)
  }

}