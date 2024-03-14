import { FC, useState, useCallback, useMemo } from "react";
import every from "lodash/every";
import { P1, Stack, Button } from "@deskpro/deskpro-ui";
import {
  IDeskproClient,
  useDeskproAppTheme,
  useDeskproAppClient,
  useDeskproAppEvents,
  adminGenericProxyFetch,
} from "@deskpro/app-sdk";
import { Settings } from "../types";
import { User } from "../context/StoreProvider/types/types";
import { toBase64 } from "../utils";

export const preInstalledRequest = async (
  client: IDeskproClient,
  settings: Required<Pick<Settings, "domain" | "username" | "api_key">>
): Promise<User | null> => {
  const { domain, username, api_key } = settings;
  const auth = `${username}:${api_key}`;

  const dpFetch = await adminGenericProxyFetch(client);

  const res = await dpFetch(
    `https://${domain}.atlassian.net/rest/api/3/myself`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${toBase64(auth)}`,
      },
    }
  );

  if (res.status !== 200) {
    throw new Error(`Request failed: [${res.status}] ${await res.text()}`);
  }

  try {
    return await res.json();
  } catch (e) {
    return null;
  }
};

const VerifySettings: FC = () => {
  const { client } = useDeskproAppClient();
  const { theme } = useDeskproAppTheme();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<Settings>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const errorMessage = useMemo(
    () => "Failed to connect to Jira, settings seem to be invalid",
    []
  );

  useDeskproAppEvents(
    {
      onAdminSettingsChange: setSettings,
    },
    [client]
  );

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

    return preInstalledRequest(client, {
      domain: settings.domain,
      username: settings.username,
      api_key: settings.api_key,
    })
      .then(setCurrentUser)
      .catch(() => setError(errorMessage))
      .finally(() => setIsLoading(false));
  }, [client, settings, errorMessage]);

  return (
    <div style={{ margin: "-8px" }}>
      <Stack align="baseline">
        <Button
          text="Verify Settings"
          intent="secondary"
          style={{ minWidth: "72px", justifyContent: "center" }}
          onClick={onVerifySettings}
          loading={isLoading}
          disabled={
            !every(
              [settings?.domain, settings?.username, settings?.api_key] ||
                isLoading
            )
          }
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
          <P1 style={{ color: theme.colors.red100 }}>{error}</P1> || ""
        )}
      </Stack>
    </div>
  );
};

export { VerifySettings };
