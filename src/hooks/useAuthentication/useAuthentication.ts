import { getAuthenticatedUser, getCloudId } from "@/api/auth";
import { CredentialMode, JiraError } from "@/api/jiraRequest";
import { CREDENTIAL_MODE_PATH, IS_USING_OAUTH2 } from "@/constants";
import { ContextSettings } from "@/types/deskpro";
import { IDeskproClient, useQueryWithClient } from "@deskpro/app-sdk";

/**
 * Why Jira turned the credential down. Kept apart because each has a different fix, and the three
 * statuses behind them are indistinguishable to whoever reports the problem.
 */
export type AuthFailure = "credentials" | "permissions" | "site";

export type AuthResult =
  | { isAuthenticated: true }
  | { isAuthenticated: false; failure: AuthFailure };

const FAILURE_BY_STATUS: Record<number, AuthFailure> = {
  401: "credentials",
  403: "permissions",
  404: "site",
};

interface UseAuthenticationParams {
  isUsingOAuth: boolean
  settings?: ContextSettings
}

export default function useAuthentication(params: Readonly<UseAuthenticationParams>) {
  const { isUsingOAuth, settings } = params
  const { isLoading, isFetching, data } = useQueryWithClient(
    ["authStatus", isUsingOAuth.toString()],
    async (client) => {
      return await getIsAuthenticated(client, isUsingOAuth, settings)
    }
  )

  return {
    isLoading: isLoading || isFetching,
    isAuthenticated: data?.isAuthenticated ?? false,
    failure: data?.isAuthenticated === false ? data.failure : undefined,
  }
}

function failureFor(e: unknown): AuthFailure | undefined {
  return e instanceof JiraError ? FAILURE_BY_STATUS[e.statusCode] : undefined
}

export async function getIsAuthenticated(
  client: IDeskproClient,
  isUsingOAuth: boolean,
  settings?: ContextSettings,
): Promise<AuthResult> {
  // jiraRequest reads this back to pick the credential, so it has to be set before any call.
  await client.setUserState<boolean>(IS_USING_OAUTH2, isUsingOAuth)

  if (isUsingOAuth) {
    return await attempt(client)
  }

  return await probeApiKey(client, settings)
}

/**
 * Works out which host this API key authenticates against, and remembers it.
 *
 * A classic token is only accepted by the site host, and a scoped one — all an Atlassian service
 * account can hold — only by the platform gateway. Both start with "ATATT", so the token cannot be
 * told apart by looking at it: the site host is tried first and the gateway only after a rejection.
 * A stored answer is cleared once it stops working, so swapping the credential for the other kind
 * re-probes rather than failing for good.
 */
async function probeApiKey(client: IDeskproClient, settings?: ContextSettings): Promise<AuthResult> {
  const stored = (await client.getUserState<CredentialMode>(CREDENTIAL_MODE_PATH))[0]?.data
  const firstHost: CredentialMode = stored === "gateway" ? "gateway" : "site"
  const secondHost: CredentialMode = firstHost === "site" ? "gateway" : "site"

  const onFirst = await attempt(client, firstHost, settings)

  if (onFirst.isAuthenticated) {
    await client.setUserState<CredentialMode>(CREDENTIAL_MODE_PATH, firstHost)

    return onFirst
  }

  // Only a rejected credential earns a second host. A 403 or a 404 means the request arrived and
  // was understood, so the other host would answer the same way.
  if (onFirst.failure === "credentials") {
    const onSecond = await attempt(client, secondHost, settings)

    if (onSecond.isAuthenticated) {
      await client.setUserState<CredentialMode>(CREDENTIAL_MODE_PATH, secondHost)

      return onSecond
    }
  }

  // A stored host that stopped working is left as it is: the next attempt starts there, fails the
  // same way, and falls through to the other one, which is the same probe this just ran.
  return onFirst
}

async function attempt(
  client: IDeskproClient,
  credentialMode?: CredentialMode,
  settings?: ContextSettings,
): Promise<AuthResult> {
  try {
    const cloudID = credentialMode === "gateway" ? await getCloudId(client, settings) : undefined

    await getAuthenticatedUser(client, { credentialMode, cloudID, settings })

    return { isAuthenticated: true }
  } catch (e) {
    const failure = failureFor(e)

    if (failure) {
      return { isAuthenticated: false, failure }
    }

    // Pass non-auth errors to the error boundary.
    throw e
  }
}
