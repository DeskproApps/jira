import { adminGenericProxyFetch, IDeskproClient, proxyFetch } from "@deskpro/app-sdk";
import { CLOUD_ID_PATH } from "@/constants";
import { ContextSettings } from "@/types/deskpro";

interface TenantInfo {
  cloudId?: string;
}

const CLOUD_ID_FORMAT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const CANNOT_DETERMINE =
  "Could not determine the Jira cloud ID for this site. Enter it manually in the app's Cloud ID setting.";

/**
 * This value is interpolated into the url the credential is then sent to, and it arrives from an
 * admin's typing or from a remote response, so its shape is checked rather than trusted. A cloud
 * id is a UUID; anything carrying a "/", "?" or "#" would address a path we did not intend.
 */
function assertIsCloudId(value: string): string {
  if (!CLOUD_ID_FORMAT.test(value)) {
    throw new Error(`${CANNOT_DETERMINE} The value found was not in the expected format.`);
  }

  return value;
}

/**
 * The cloud id the platform gateway addresses this site by.
 *
 * Read in order of cost: the admin setting, then anything already cached, then Atlassian.
 *
 * `_edge/tenant_info` is not part of Atlassian's supported API, so the `cloud_id` setting exists
 * as the way out if it changes. It takes no credential, which is what makes it usable here — a
 * scoped token cannot authenticate against the site host at all.
 */
export default async function getCloudId(
  client: IDeskproClient,
  settings?: ContextSettings,
): Promise<string> {
  if (settings?.cloud_id) {
    return assertIsCloudId(settings.cloud_id.trim());
  }

  const cached = (await client.getUserState<string>(CLOUD_ID_PATH))[0]?.data;

  if (cached) {
    return assertIsCloudId(cached);
  }

  const isAdmin = Boolean(settings?.username && settings?.api_key);
  const dpFetch = await (isAdmin ? adminGenericProxyFetch : proxyFetch)(client);
  const host = isAdmin ? `${settings?.domain}` : "__domain__";

  const response = await dpFetch(`https://${host}.atlassian.net/_edge/tenant_info`);

  if (!response.ok) {
    throw new Error(CANNOT_DETERMINE);
  }

  const { cloudId } = (await response.json()) as TenantInfo;

  if (!cloudId) {
    throw new Error(CANNOT_DETERMINE);
  }

  assertIsCloudId(cloudId);

  await client.setUserState(CLOUD_ID_PATH, cloudId);

  return cloudId;
}
