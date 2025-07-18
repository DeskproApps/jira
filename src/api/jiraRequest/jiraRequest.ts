import { adminGenericProxyFetch, IDeskproClient, proxyFetch } from "@deskpro/app-sdk";
import { ApiRequestMethod } from "@/types";
import { CLOUD_ID_PATH, IS_USING_OAUTH2, OAUTH2_ACCESS_TOKEN_PATH } from "@/constants";
import { ContextSettings } from "@/types/deskpro";

interface JiraRequestParams {
  method?: ApiRequestMethod,
  endpoint: string
  payload?: unknown
  settings?: ContextSettings
}

/**
 * Wrapper fetch function for requests to the Jira API.
 *
 * @template T - The type of the response data.
 * 
 * @throws {JiraError} If the HTTP status code indicates a failed request (not 2xx or 3xx).
 */
export default async function jiraRequest<T>(client: IDeskproClient, params: Readonly<JiraRequestParams>): Promise<T> {
  const { method = "GET", endpoint, payload, settings
  } = params
  const isAdmin = Boolean(settings?.username && settings?.api_key);
  const dpFetch = await (isAdmin ? adminGenericProxyFetch : proxyFetch)(client);
  const isUsingOAuth2 = (await client.getUserState<boolean>(IS_USING_OAUTH2))[0]?.data;
  const cloudID = (await client.getUserState<string>(CLOUD_ID_PATH))[0]?.data;

  const baseURL = isUsingOAuth2 ? `https://api.atlassian.com/ex/jira/${cloudID}/rest/api/3`
    : isAdmin
      ? `https://${settings?.domain}.atlassian.net/rest/api/3`
      : `https://__domain__.atlassian.net/rest/api/3`;
  const url = baseURL + endpoint;

  const auth = isUsingOAuth2 ? `Bearer [user[${OAUTH2_ACCESS_TOKEN_PATH}]]`
    : isAdmin
      ? `Basic ${btoa(`${settings?.username}:${settings?.api_key}`)}`
      : "Basic __username+':'+api_key.base64__";

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
