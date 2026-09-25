import { ContextSettings } from "@/types/deskpro";
import { OAUTH2_ACCESS_TOKEN_PATH } from "@/constants";

/**
 * Where an API-key credential is accepted.
 *
 * Atlassian splits this by token type and the two are mutually exclusive: a classic token only
 * authenticates against the site host, a scoped token only against the platform gateway. Both
 * start with "ATATT", so the token itself cannot be told apart — which is why this is probed
 * rather than configured.
 */
export type CredentialMode = "site" | "gateway";

export const DEFAULT_CREDENTIAL_MODE: CredentialMode = "site";

interface ResolveTransportParams {
  isUsingOAuth2: boolean;
  credentialMode: CredentialMode;
  cloudID?: string;
  settings?: ContextSettings;
}

export interface Transport {
  baseURL: string;
  authorization: string;
}

function gatewayBaseURL(cloudID?: string): string {
  return `https://api.atlassian.com/ex/jira/${cloudID}/rest/api/3`;
}

/**
 * The host and credential a request should be made with.
 *
 * Three callers reach this: the OAuth agent path, the admin settings page — which holds the real
 * credential values because an admin is entering them — and the agent API-key path, where the
 * proxy substitutes the placeholders on the way out.
 */
export default function resolveTransport(params: Readonly<ResolveTransportParams>): Transport {
  const { isUsingOAuth2, credentialMode, cloudID, settings } = params;

  if (isUsingOAuth2) {
    return {
      baseURL: gatewayBaseURL(cloudID),
      authorization: `Bearer [user[${OAUTH2_ACCESS_TOKEN_PATH}]]`,
    };
  }

  const isAdmin = Boolean(settings?.username && settings?.api_key);

  const authorization = isAdmin
    ? `Basic ${btoa(`${settings?.username}:${settings?.api_key}`)}`
    : "Basic __username+':'+api_key.base64__";

  if (credentialMode === "gateway") {
    return { baseURL: gatewayBaseURL(cloudID), authorization };
  }

  return {
    baseURL: isAdmin
      ? `https://${settings?.domain}.atlassian.net/rest/api/3`
      : "https://__domain__.atlassian.net/rest/api/3",
    authorization,
  };
}
