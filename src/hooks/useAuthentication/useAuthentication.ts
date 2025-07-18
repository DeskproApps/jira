import { getAuthenticatedUser } from "@/api/auth";
import { checkIsAuth } from "@/api/checkIsAuth";
import { JiraError } from "@/api/jiraRequest";
import { CLOUD_ID_PATH, IS_USING_OAUTH2 } from "@/constants";
import { useQueryWithClient } from "@deskpro/app-sdk";

interface UseAuthenticationParams {
  isUsingOAuth: boolean
}
export default function useAuthentication(params: Readonly<UseAuthenticationParams>) {
  const { isUsingOAuth } = params
  const authStatusResponse = useQueryWithClient(
    ["authStatus", isUsingOAuth.toString()],
    async (client) => {
      try {
        // Store the authentication method in the user state.
        await client.setUserState(IS_USING_OAUTH2, isUsingOAuth)

        // Verify authentication status.
        // If OAuth2 mode and the user is logged in the request would be make with their stored access token.
        // If in API key mode the request would be made with the API key provided in the app setup.
        await getAuthenticatedUser(client)

        // Get the user's cloud when using OAuth as their Jira domain isn't provided when using this mode.
        if (isUsingOAuth) {
          const resources = await checkIsAuth({ client })
          if (!resources[0]?.id) {
            return false
          }

          await client.setUserState(CLOUD_ID_PATH, resources[0].id);
        }

        return true
      } catch (e) {

        if (e instanceof JiraError && [401, 403].includes(e.statusCode)) {
          return false
        }

        // Pass non-auth errors to the error boundary.
        throw e
      }
    }
  )

  return {
    isLoading: authStatusResponse.isLoading,
    isAuthenticated: authStatusResponse.data ?? false
  }
}