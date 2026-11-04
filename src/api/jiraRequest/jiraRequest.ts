import { adminGenericProxyFetch, IDeskproClient, proxyFetch } from "@deskpro/app-sdk";
import { ApiRequestMethod } from "@/types";
import { CLOUD_ID_PATH, CREDENTIAL_MODE_PATH, IS_USING_OAUTH2 } from "@/constants";
import { ContextSettings } from "@/types/deskpro";
import resolveTransport, { CredentialMode, DEFAULT_CREDENTIAL_MODE } from "./resolveTransport";

interface JiraRequestParams {
  method?: ApiRequestMethod,
  endpoint: string
  payload?: unknown
  settings?: ContextSettings
  /** Forces the host to use, instead of the stored one. Set by the authentication probe. */
  credentialMode?: CredentialMode
  /** Supplies the cloud id before one has been cached, for the same reason. */
  cloudID?: string
}

async function storedCredentialMode(client: IDeskproClient): Promise<CredentialMode> {
  return (await client.getUserState<CredentialMode>(CREDENTIAL_MODE_PATH))[0]?.data
    ?? DEFAULT_CREDENTIAL_MODE;
}

/**
 * Wrapper fetch function for requests to the Jira API.
 *
 * @template T - The type of the response data.
 *
 * @throws {JiraError} If the HTTP status code indicates a failed request (not 2xx or 3xx).
 */
export default async function jiraRequest<T>(client: IDeskproClient, params: Readonly<JiraRequestParams>): Promise<T> {
  const { method = "GET", endpoint, payload, settings } = params
  const isAdmin = Boolean(settings?.username && settings?.api_key);
  const dpFetch = await (isAdmin ? adminGenericProxyFetch : proxyFetch)(client);
  const isUsingOAuth2 = Boolean((await client.getUserState<boolean>(IS_USING_OAUTH2))[0]?.data);
  const cloudID = params.cloudID ?? (await client.getUserState<string>(CLOUD_ID_PATH))[0]?.data ?? undefined;
  // Only the API-key path has a host to choose, so OAuth traffic skips the lookup.
  const credentialMode = isUsingOAuth2
    ? DEFAULT_CREDENTIAL_MODE
    : params.credentialMode ?? await storedCredentialMode(client);

  const { baseURL, authorization: auth } = resolveTransport({
    isUsingOAuth2,
    credentialMode,
    cloudID,
    settings,
  });
  const url = baseURL + endpoint;

  let body = undefined;

  if (payload instanceof FormData || typeof payload === "string") {
    body = payload
  } else if (payload) {
    body = JSON.stringify(payload)
  }

  const headers: Record<string, string> = {
    Authorization: auth,
    Accept: "application/json",
  }

  if (body instanceof FormData) {
    headers["X-Atlassian-Token"] = "no-check";
  } else if (payload) {
    headers["Content-Type"] = "application/json";
  }

  const response = await dpFetch(url, {
    method,
    body,
    headers,
  });

  if (isResponseError(response)) {
    let errorData: unknown
    const rawText = await response.text()

    try {
      errorData = JSON.parse(rawText)
    } catch {
      errorData = { message: "Unexpected response from Jira. The error format was not recognised.", raw: rawText }
    }

    throw new JiraError("Jira API Request Failed", { statusCode: response.status, data: errorData })

  }

  // This should only happen when updating data.
  if (response.status === 204) {
    return undefined as T;
  }
  return await response.json() as T
}

export type JiraErrorPayload = {
  statusCode: number;
  data?: unknown;
};

export class JiraError extends Error {
  statusCode: number;
  data: JiraErrorPayload["data"];


  constructor(message: string, { statusCode, data }: JiraErrorPayload) {
    super(message)

    this.name = "JiraError"
    this.data = data
    this.statusCode = statusCode
  }
}

function isResponseError(response: Response): boolean {
  return response.status < 200 || response.status >= 400
}
