import { FC, useState, useCallback } from "react";
import { P1, Stack, Button } from "@deskpro/deskpro-ui";
import {
  IDeskproClient,
  useDeskproAppTheme,
  useDeskproAppClient,
  adminGenericProxyFetch,
  useDeskproLatestAppContext,
} from "@deskpro/app-sdk";
import { User } from "../../api/types/types";
import { getCloudId } from "@/api/auth";
import { ContextData, ContextSettings } from "@/types/deskpro";

export const preInstalledRequest = async (
  client: IDeskproClient,
  settings: Required<Pick<ContextSettings, "domain" | "username" | "api_key">> & { cloud_id?: string },
): Promise<User | null> => {
  const { username, api_key } = settings;
  const auth = `${username}:${api_key}`;

  const dpFetch = await adminGenericProxyFetch(client);

  const call = (baseURL: string) => dpFetch(`${baseURL}/rest/api/3/myself`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(auth)}`,
    },
  });

  let res = await call(`https://${settings.domain}.atlassian.net`);

  // A scoped token — the only kind a service account can hold — is refused by the site host and
  // only accepted by the platform gateway. Verification has to agree with the app, which probes
  // the same two hosts in the same order.
  if (res.status === 401) {
    const cloudID = await getCloudId(client, settings);

    res = await call(`https://api.atlassian.com/ex/jira/${cloudID}`);
  }

  if (res.status !== 200) {
    throw new Error(`Request failed: [${res.status}] ${await res.text()}`);
  }

  try {
    return await res.json() as User;
  } catch (e) {
    return null;
  }
};

const VerifySettings: FC = () => {
  const { client } = useDeskproAppClient();
  const { theme } = useDeskproAppTheme();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
    const { context } = useDeskproLatestAppContext<ContextData, ContextSettings>()

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const settings = context?.settings

  const errorMessage = "Failed to connect to Jira, settings seem to be invalid"

  const onVerifySettings = useCallback(() => {
    if (
      !client ||
      !settings?.domain ||
      !settings?.username ||
      !settings?.api_key
    ) {
      return;
    }

    setIsLoading(true);
    setError("");
    setCurrentUser(null);

    preInstalledRequest(client, {
      domain: settings.domain,
      username: settings.username,
      api_key: settings.api_key,
      cloud_id: settings.cloud_id,
    })
      .then(setCurrentUser)
      .catch(() => setError(errorMessage))
      .finally(() => setIsLoading(false));
  }, [client, settings, errorMessage]);

  return (
    <>
      <Stack align="baseline">
        <Button
          text="Verify Settings"
          intent="secondary"
          style={{ justifyContent: "center" }}
          onClick={onVerifySettings}
          loading={isLoading}
          disabled={[
            settings?.domain,
            settings?.username,
            settings?.api_key,
            isLoading,
          ].every((v) => !v)}
        />
        &nbsp;
        {currentUser ? (
          <P1 style={{ marginBottom: "6px" }}>
            Verified as{" "}
            <span style={{ color: theme.colors.grey100 }}>
              {currentUser.displayName} {`<${currentUser.emailAddress}>`}
            </span>
          </P1>
        ) : (
          <>
            {error ? <P1 style={{ color: theme.colors.red100 }}>{error}</P1> : ""}
          </>
        )}
      </Stack>
    </>
  );
};

export { VerifySettings };
