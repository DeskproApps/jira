import { getAuthenticatedUser } from "@/api/auth";
import { JiraError } from "@/api/jiraRequest";
import { IS_USING_OAUTH2 } from "@/constants";
import { IDeskproClient, useQueryWithClient } from "@deskpro/app-sdk";

interface UseAuthenticationParams {
  isUsingOAuth: boolean
}

export default function useAuthentication(params: Readonly<UseAuthenticationParams>) {
  const { isUsingOAuth } = params
  const { isLoading, isFetching, data } = useQueryWithClient(
    ["authStatus", isUsingOAuth.toString()],
    async (client) => {
      return await getIsAuthenticated(client, isUsingOAuth)
    }
  )

  return {
    isLoading: isLoading || isFetching,
    isAuthenticated: data ?? false
  }
}

export async function getIsAuthenticated(client: IDeskproClient, isUsingOAuth: boolean) {
  try {
    // Store the authentication method in the user state.
    await client.setUserState<boolean>(IS_USING_OAUTH2, isUsingOAuth)

    // Verify authentication status.
    // If OAuth2 mode and the user is logged in the request would be make with their stored access token.
    // If in API key mode the request would be made with the API key provided in the app setup.
    await getAuthenticatedUser(client)

    return true
  } catch (e) {

    if (e instanceof JiraError && [401, 403, 404].includes(e.statusCode)) {
      return false
    }

    // Pass non-auth errors to the error boundary.
    throw e
  }
}